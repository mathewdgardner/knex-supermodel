'use strict';

module.exports = {
  client: 'pg',
  connection: {
    charset: 'utf8',
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: 'base_test'
  },
  pool: {
    min: 2,
    max: 10,
    bailAfter: 10000
  }
};
