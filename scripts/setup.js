/* eslint-disable no-console */

'use strict';

const config = require('../knexfile');
delete config.connection.database;
const knex = require('knex')(config);

console.log('Creating database');

knex.raw('CREATE DATABASE base_test;')
  .then(() => knex.destroy())
  .done();
