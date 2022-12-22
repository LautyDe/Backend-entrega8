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
const products = new Contenedor(connectionMySql, "products");
const messages = new Contenedor(connectionSqlite3, "messages");

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

const connectionFunctions = require("./controllers/connection.js");

/* Creo tablas de productos y mensajes */
connectionFunctions.mysqlFunc();
connectionFunctions.sqlite3Func();

app.post("/", async (req, res) => {
    const data = req.body;
    const nuevoProducto = await products.save(data);
    !data && res.status(204).json(notFound);
    res.status(201);
});

io.on("connection", async socket => {
    console.log("Usuario conectado");

    try {
        /* cargar los productos */
        const listaProductos = await products.getAll();
        socket.emit("list-products", listaProductos);

        socket.on("new-product", async data => {
            await products.save(data);
            const newProducts = await products.getAll();
            io.sockets.emit("product", newProducts);
        });

        /* cargar todos los mensajes a la primera conexion */
        const listaMensajes = await messages.getAll();
        socket.emit("message", listaMensajes);

        socket.on("new-message", async data => {
            data.date = moment(new Date()).format("DD/MM/YYYY hh:mm:ss");
            await messages.save(data);

            const allMessages = await messages.getAll();
            io.sockets.emit("messages", allMessages);
        });

        socket.on("disconnect", () => {
            console.log("Usuario desconectado");
        });
    } catch (error) {
        console.log(`Ocurrio un error! ${error.message}`);
    }
});

server.listen(PORT, () => {
    console.log(
        `Servidor http escuchando en el puerto ${server.address().port}`
    );
    console.log(`http://localhost:${server.address().port}`);
});
server.on("error", error => console.log(`Error en servidor: ${error}`));
