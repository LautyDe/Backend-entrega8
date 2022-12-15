const { Router } = require("express");
const router = Router();
const Contenedor = require("../../controllers/controller.js");
const products = new Contenedor("controllers/productos.json");
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
        productos: arrayProductos,
        style: "productos.css",
        title: "Productos con Handlebars",
    });
});

module.exports = router;
