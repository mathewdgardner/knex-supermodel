'use strict';

const Config = require('./config');
const proxyHandler = require('./proxy_handler');
const snakeCase = require('lodash.snakecase');
const transform = require('lodash.transform');
const Util = require('./util');

/**
 * Base model class to be extended that basically wraps around Knex. Holds helpful static methods.
 *
 * @class
 */
class Base {
  /**
   * Get the knex to be used.
   *
   * @returns {Function} The knex to be used.
   */
  static get knex() {
    return Config.knex;
  }

  /**
   * Set the knex to be used and save it for future use.
   *
   * @param k {Function} Knex to be used.
   */
  static set knex(k) {
    Config.knex = k;
  }

  /**
   * Get the table used for this model.
   *
   * @returns {string} The database table used.
   */
  static get table() {
    if (!this._table) {
      this._table = Util.table(this);
    }

    return this._table;
  }

  /**
   * Set the table used for this model.
   *
   * @param {string} t The database table to be used.
   */
  static set table(t) {
    this._table = t;
  }

  /**
   * Get the primary or compound keys used to uniquely identify a model.
   *
   * @returns {array} The columns used to uniquely identify a model.
   */
  static get keys() {
    if (!this._keys) {
      this._keys = [];
    }

    return this._keys;
  }

  /**
   * Set the primary or compound keys used to uniquely identify a model.
   *
   * @param {array} k The columns used to uniquely identify a model.
   */
  static set keys(k) {
    this._keys = k;
  }

  /**
   * Forges a model but does not insert. Calls the constructor under the hood.
   *
   * @param {Object} properties The Model properties.
   * @param {Object} opts Options.
   * @returns {*} An instantiation of the model.
   */
  static forge(properties = {}, opts = {}) {
    return new this(properties, opts);
  }

  /**
   * Inserts a new model into the database then returns an instantiation of the model.
   *
   * @param {Object} properties The Model properties.
   * @param {Object} opts Options.
   * @returns {*} An instantiation of the model.
   */
  static create(properties, opts = {}) {
    const knex = Util.assertKnex(opts.trx || opts.knex || Config.knex);

    return knex(this.table)
      .insert(Util.toSnake(properties), '*')
      .spread((res) => new this(Util.toCamel(res), opts));
  }

  /**
   * Selects the first record then returns an instantiation of the model.
   *
   * @param {Object} query The Query object.
   * @param {Object} opts Options.
   * @returns {*} An instantiation of the model, if it exists, null otherwise.
   */
  static fetch(query = {}, opts = {}) {
    const knex = Util.assertKnex(opts.trx || opts.knex || Config.knex);

    return knex(this.table)
      .first('*')
      .where(Util.toSnake(query))
      .then((res) => (typeof res === 'undefined') ? null : new this(Util.toCamel(res), opts));
  }

  /**
   * Saves the properties currently set on the model.
   *
   * @param {Object} properties The properties to update.
   * @param {Object} where Where clause for updating.
   * @param {Object} opts Options for saving.
   * @return {Array} A collection of the updated models.
   */
  static update(properties, where = {}, opts = {}) {
    const knex = Util.assertKnex(opts.trx || opts.knex || Config.knex);

    return knex(this.table)
      .update(Util.toSnake(properties), '*')
      .where(where)
      .map((res) => {
        const model = new this(Util.toCamel(res), opts);
        model._safeProperties = res;

        return model;
      });
  }

  /**
   * Deletes models matching the given where clause.
   *
   * @param {Object} where Where clause for updating.
   * @param {Object} opts Options for saving.
   * @return {Promise} A knex promise yielding rows affected.
   */
  static destroy(where = {}, opts = {}) {
    const knex = Util.assertKnex(opts.trx || opts.knex || Config.knex);

    return knex(this.table)
      .del()
      .where(where);
  }

  /**
   * Get a collection of models matching a given query.
   *
   * @param {Object} query The query to match against.
   * @param {Object} opts Options.
   * @returns {Array} An array holding resultant models.
   */
  static collection(query = {}, opts = {}) {
    const knex = Util.assertKnex(opts.trx || opts.knex || Config.knex);

    return knex(this.table)
      .select()
      .where(Util.toSnake(query))
      .map((res) => new this(Util.toCamel(res), opts));
  }

  /**
   * Forges a new object but does not persist to DB. Does not need to be overridden.
   *
   * @constructor
   * @param {Object} properties Additional properties to set.
   * @param {Object} config A configuration object for options.
   * @returns {*} An instantiation of the model with given properties set.
   */
  constructor(properties = {}, config = {}) {
    Config.knex = config.knex || Config.knex;
    this._trx = config.trx;
    this._properties = properties;
    this._safeProperties = Util.toSnake(properties);

    return new Proxy(this, proxyHandler); // eslint-disable-line no-undef
  }

  /**
   * Saves the properties currently set on the model.
   *
   * @param {Object} opts Options for saving.
   * @return {*} An updated copy of the model.
   */
  save(opts = {}) {
    const knex = Util.assertKnex(opts.trx || opts.knex || this._trx || Config.knex);
    const method = opts.method || 'insert';

    // Disallow unknown saving methods
    if (method !== 'insert' && method !== 'update') {
      throw new Error('Only the `insert` and `update` methods are allowed while saving.');
    }

    transform(this._properties, (result, value, key) => {
      result[snakeCase(key)] = value;
    }, this._safeProperties);

    return knex(this.constructor.table)[method](this._safeProperties, '*')
      .spread((res) => {
        // Save computed values
        transform(res, (result, value, key) => {
          result[key] = value;
        }, this._properties);

        this._safeProperties = res;

        return this;
      });
  }

  /**
   * Delete the model.
   *
   * @param {Object} opts Options for saving.
   * @return {Promise} A knex promise yielding rows affected.
   */
  destroy(opts = {}) {
    const knex = Util.assertKnex(opts.trx || opts.knex || this._trx || Config.knex);
    let where = { id: this.id };

    // Custom primary or compound keys
    if (this.constructor.keys.length) {
      where = transform(this.constructor.keys, (a, v) => {
        a[snakeCase(v)] = this[v];
      }, {});
    }

    return knex(this.constructor.table)
      .del()
      .where(where);
  }

  transaction(trx) {
    this._trx = trx;

    return this;
  }

  /**
   * Serializes the model into JSON.
   *
   * @returns {String} The model stringified.
   */
  toString() {
    return JSON.stringify(this._properties);
  }
}

/**
 * @module
 * @type {Base}
 */
module.exports = Base;
