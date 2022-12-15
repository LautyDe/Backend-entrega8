/* Importacion de librerias internas y externas */
const express = require("express");
const app = express();
const PORT = 8080;

/* Socket / Http */
const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = new Server(server);

/* SQL */
const options = require("./controllers/options.js");
const knex = require("knex");
const connectionMySql = knex(options.mysql);
const connectionSqlite3 = knex(options.sqlite3);
const bp = require("body-parser");
const routers = require("./public/routers");
const handlebars = require("express-handlebars");

const moment = require("moment/moment");
const Contenedor = require("./controllers/SQLController.js");
const productos = new Contenedor(options.mysql, "productos");
const mensajes = new Contenedor(options.sqlite3, "mensajes");

/* middlewares incorporados */
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.engine(
    "hbs",
    handlebars.engine({
        extname: "hbs",
        defaultLayout: "index.hbs",
        layoutsDir: __dirname + "/views",
    })
);

app.set("views", "./views");
app.set("view engine", "hbs");

app.use("/", routers);
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("welcome", {
        style: "welcome.css",
        title: "Bienvenido",
    });
});

connectionMySql.schema
    .hasTable("productos")
    .then(exists => {
        if (exists) {
            connectionMySql.schema
                .createTable("productos", table => {
                    table.increments("id").primary;
                    table.string("title", 25).notNullable();
                    table.float("price");
                    table.string("thumbnail", 100);
                })
                .then(() => console.log("Tabla creada con exito!"))
                .catch(error => console.log(error));
        }
    })
    .catch(error => console.log(error));

connectionSqlite3.schema
    .hasTable("mensajes")
    .then(exists => {
        if (!exists) {
            connectionMySql.schema
                .createTable("productos", table => {
                    table.increments("id").primary;
                    table.string("email", 40).notNullable();
                    table.string("mensaje", 100).notNullable();
                    table.string("date", 100).notNullable();
                })
                .then(() => console.log("Tabla creada con exito!"))
                .catch(error => console.log(error));
        }
    })
    .catch(error => console.log(error));

app.post("/", async (req, res) => {
    const data = req.body;
    const nuevoProducto = await productos.save(data);
    !data && res.status(204).json(notFound);
    res.status(201).render("formulario", {});
});

server.listen(PORT, () => {
    console.log(
        `Servidor http escuchando en el puerto ${server.address().port}`
    );
    console.log(`http://localhost:${server.address().port}`);
});
server.on("error", error => console.log(`Error en servidor: ${error}`));

io.on("connection", async socket => {
    console.log("Nuevo cliente conectado");

    /* cargar los productos */
    const listaProductos = await productos.getAll();
    socket.emit("new-connection", listaProductos);
    socket.on("new-product", data => {
        productos.save(data);
        io.sockets.emit("producto", data);
    });

    /* cargar todos los mensajes a la primera conexion */
    const listaMensajes = await mensajes.getAll();
    socket.emit("mensaje", listaMensajes);
    socket.emit("mensaje", mensajes);

    socket.on("nuevo-mensaje", async data => {
        data.time = moment(new Date()).format("DD/MM/YYYY hh:mm:ss");
        await mensajes.save(data);
        io.sockets.emit("mensajes", mensajes);
    });
});
