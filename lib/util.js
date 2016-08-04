'use strict';

const _ = require('lodash');
const assert = require('assert');
const inflection = require('inflection');

/**
 * Static utility class.
 */
class Util {
  /**
   * Static Helper method to return a pluralized table name for the model in both a static and nonstatic context.
   *
   * @returns {String} The pluralized database table's name.
   */
  static table(thiz) {
    if (thiz.constructor.name === 'Function') {
      // static context
      return inflection.tableize(thiz.name);
    }

    // non-static context
    return inflection.tableize(thiz.constructor.name);
  }

  /**
   * Helper method to convert an object into a snake_case format for use with knex.
   *
   * @param {Object} obj The object to convert.
   * @returns {Object} The resultant snake_case object.
   */
  static toSnake(obj) {
    return _.transform(obj, (result, value, key) => {
      result[_.snakeCase(key)] = value;
    }, {});
  }

  /**
   * Helper method to convert an object into a camelCase format for use with after knex.
   *
   * @param {Object} obj The object to convert.
   * @returns {Object} The resultant camelCase object.
   */
  static toCamel(obj) {
    return _.transform(obj, (result, value, key) => {
      result[_.camelCase(key)] = value;
    }, {});
  }

  static assertKnex(knex) {
    assert(knex, 'You must provide a knex object!');

    return knex;
  }
}

/**
 * @module
 * @type {Util}
 */
module.exports = Util;
