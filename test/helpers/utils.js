'use strict';

exports.clear = (knex) => {
  return knex.raw('TRUNCATE TABLE models CASCADE');
};
