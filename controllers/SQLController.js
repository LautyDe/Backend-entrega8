class Contenedor {
    constructor(connection, table) {
        this.connection = connection;
        this.table = table;
    }

    async save(objeto) {
        try {
            await this.connection(this.table).insert(objeto);
        } catch (error) {
            console.log(`Error agregando objeto a la tabla: ${error.message}`);
        }
    }

    async getById(id) {
        try {
            return await this.connection(this.table).where("id", id);
        } catch (error) {
            console.log(`Error buscando objeto con el id: ${error.message}`);
        }
    }

    async getAll() {
        try {
            return await this.connection(this.table);
        } catch (error) {
            console.log(`Error obteniendo tabla: ${error.message}`);
        }
    }

    async deleteById(id) {
        try {
            return await this.connection(this.table).where("id", id).del();
        } catch (error) {
            console.log(
                `Ocurrio un error eliminando el objeto con el id solicitado: ${error.message}`
            );
        }
    }

    async deleteAll() {
        try {
            await this.connection(this.table).del();
        } catch (error) {
            console.log(
                `Ocurrio un error eliminando los datos: ${error.message}`
            );
        }
    }
}

module.exports = Contenedor;
