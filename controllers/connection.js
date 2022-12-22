const options = require("./options.js");
const knex = require("knex");

const connectionMySql = knex(options.mysql);
const connectionSqlite3 = knex(options.sqlite3);

const mysqlFunc = () => {
    connectionMySql.schema.hasTable("products").then(exists => {
        if (!exists) {
            connectionMySql.schema
                .createTable("products", table => {
                    table.increments("id").primary;
                    table.string("title", 25).notNullable();
                    table.float("price");
                    table.string("thumbnail", 100);
                })
                .then(() => console.log("Tabla creada con exito"))
                .catch(error => console.log(error));
        }
    });
};

const sqlite3Func = () => {
    connectionSqlite3.schema.hasTable("messages").then(exists => {
        if (!exists) {
            connectionSqlite3.schema
                .createTable("messages", table => {
                    table.increments("id").primary;
                    table.string("email", 40).notNullable();
                    table.string("text", 100).notNullable();
                    table.string("date", 100).notNullable();
                })
                .then(() => console.log("Tabla creada con exito"))
                .catch(error => console.log(error));
        }
    });
};

module.exports = {
    mysqlFunc,
    sqlite3Func,
};
