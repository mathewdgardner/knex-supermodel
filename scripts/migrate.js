/* eslint-disable no-console */

'use strict';

const config = require('../knexfile');
const knex = require('knex')(config);

knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  .then(() => {
    return knex.schema.createTable('models', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      t.string('foo');
      t.string('bar');
      t.timestamp('created_at').notNullable().defaultTo(knex.raw('now()'));
      t.timestamp('updated_at').notNullable().defaultTo(knex.raw('now()'));
      t.timestamp('deleted_at').nullable().defaultTo(null);
      t.boolean('is_deleted').notNullable().defaultTo(false);
    });
  })
  .then(() => {
    console.log('Done migrating');

    return knex.destroy();
  })
  .done();
