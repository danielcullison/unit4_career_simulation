const { Client } = require("pg");
const client = new Client("postgres://localhost:5432/unit_4_career_simulation");

module.exports = client;
