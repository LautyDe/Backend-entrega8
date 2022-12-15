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
const products = new Contenedor(options.mysql, "products");
const messages = new Contenedor(options.sqlite3, "messages");

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

const mensajes = [
    {
        id: 1,
        email: "lauty.d.p@gmail.com",
        text: "Hola buenas tardes!",
        time: "16/11/2022 07:50:49",
    },
    {
        id: 2,
        email: "juanGarcia@gmail.com",
        text: "Como estas??",
        time: "16/11/2022 07:51:11",
    },
];

app.get("/", (req, res) => {
    res.render("welcome", {
        style: "welcome.css",
        title: "Bienvenido",
    });
});

connectionMySql.schema
    .hasTable("products")
    .then(exists => {
        if (!exists) {
            /* Si no existe, creo la table */
            connectionMySql.schema
                .createTable("products", table => {
                    table.increments("id").primary;
                    table.string("title", 25).notNullable();
                    table.float("price");
                    table.string("thumbnail", 100);
                })
                .then(() => console.log("Tabla creada con exito!"))
                .catch(error => console.log(error));
        } else {
            /* Si existe, la elimino y la vuelvo a crear */
            connectionMySql.schema.dropTable("products").then(
                connectionMySql.schema
                    .createTable("products", table => {
                        table.increments("id").primary;
                        table.string("title", 25).notNullable();
                        table.float("price");
                        table.string("thumbnail", 100);
                    })
                    .then(() => console.log("Tabla creada con exito!"))
                    .catch(error => console.log(error))
            );
        }
    })
    .catch(error => console.log(error));

(async () => {
    try {
        messages.saveSqlite3(mensajes);
    } catch (error) {
        console.log(error);
    }
})();

connectionSqlite3.schema
    .hasTable("messages")
    .then(exists => {
        if (!exists) {
            /* Si no existe, creo la table */
            connectionSqlite3.schema
                .createTable("messages", table => {
                    table.increments("id").primary;
                    table.string("email", 40).notNullable();
                    table.string("text", 100).notNullable();
                    table.string("time", 100).notNullable();
                })
                .then(() => console.log("Tabla creada con exito!"))
                .catch(error => console.log(error));
        } else {
            /* Si existe, la elimino y la vuelvo a crear */
            connectionSqlite3.schema.dropTable("messages").then(
                connectionSqlite3.schema
                    .createTable("messages", table => {
                        table.increments("id").primary;
                        table.string("email", 40).notNullable();
                        table.string("text", 100).notNullable();
                        table.string("time", 100).notNullable();
                    })
                    .then(() => console.log("Tabla creada con exito!"))
                    .catch(error => console.log(error))
            );
        }
    })
    .catch(error => console.log(error));

app.post("/", async (req, res) => {
    const data = req.body;
    const nuevoProducto = await products.save(data);
    !data && res.status(204).json(notFound);
    res.status(201);
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
    const listaProductos = await products.getAll();
    socket.emit("new-connection", listaProductos);
    socket.on("new-product", async data => {
        await products.saveMySql(data);
        io.sockets.emit("product", data);
    });

    /* cargar todos los mensajes a la primera conexion */
    const listaMensajes = await messages.getAll();
    socket.emit("message", listaMensajes);
    socket.emit("message", messages);

    socket.on("new-message", async data => {
        data.time = moment(new Date()).format("DD/MM/YYYY hh:mm:ss");
        await messages.saveSqlite3(data);
        io.sockets.emit("messages", messages);
    });
});
