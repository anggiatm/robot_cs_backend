const Pool = require("pg").Pool;
const pool = new Pool({
  user: "me",
  host: "localhost",
  database: "chatbot",
  password: "1",
  port: 5432,
});
const qb = require("./query_builder");

const table = "qa_record";

const collumn_setting = {
  question: "varchar",
  answer: "varchar",
  timestamp: "date-time",
};

// !!! NON EDITABLE !!!

// GET ALL DATA
const getAll = (request, response) => {
  pool.query(`SELECT * FROM ${table}`, (error, results) => {
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
      response.status(201).send(`Added with ID: ${results}`);
    }
  );
};

module.exports = {
  getAll,
  create,
};
