const Pool = require("pg").Pool;
const pool = new Pool({
  user: "me",
  host: "localhost",
  database: "chatbot",
  password: "1",
  port: 5432,
});
const qb = require("./query_builder");

const table = "tenants";
const pk = "id";

const collumn_setting = {
  name: "varchar",
  type: "varchar",
  tags: "varchar",
  location: "varchar",
  description: "varchar",
  logo: "varchar",
  image: "varchar",
};

// !!! NON EDITABLE !!!

// GET ALL DATA
const getAll = (request, response) => {
  pool.query(`SELECT * FROM ${table} ORDER BY id ASC`, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

// GET DATA BY ID
const getById = (request, response) => {
  const id = parseInt(request.params.id);
  pool.query(`SELECT * FROM ${table} WHERE ${pk} = ${id}`, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

// CREATE DATA
const create = (request, response) => {
  const column = qb.columnDividedByComma(request.body);
  const values = qb.valuesDivideByComma(request.body, collumn_setting);
  pool.query(
    `INSERT INTO ${table} (${column}) VALUES (${values})`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Tenant added with ID: ${results}`);
    }
  );
};

const update = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query(
    `UPDATE ${table} SET ${qb.columnValueDividedByComma(
      request.body,
      collumn_setting
    )} WHERE ${pk} = ${id}`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified with ID: ${id}`);
    }
  );
};

const remove = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query(`DELETE FROM ${table} WHERE ${pk} = ${id}`, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
