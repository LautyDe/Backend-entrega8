const { Router } = require("express");
const router = Router();
const options = require("../../controllers/options.js");
const knex = require("knex");
const connectionMySql = knex(options.mysql);
const connectionSqlite3 = knex(options.sqlite3);
const Contenedor = require("../../controllers/SQLcontroller.js");
const products = new Contenedor(connectionMySql, "products");
const messages = new Contenedor(connectionSqlite3, "messages");
const notFound = { error: "Producto no encontrado" };

/* ok: 200
   created: 201
   no content: 204
   bad request: 400
   not found: 404
   internal server error: 500
    */

router.get("/", async (req, res) => {
    const arrayProductos = await products.getAll();
    res.render("products", {
        products: arrayProductos,
        style: "productos.css",
        title: "Productos con Handlebars",
    });
});

router.post("/", async (req, res) => {
    const data = req.body;
    await products.save(data);
    res.status(201);
});

module.exports = router;
