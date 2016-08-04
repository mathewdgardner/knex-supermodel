'use strict';

/**
 * Singleton used for configurations.
 */
class Config {
  /**
   * Get the knex to be used.
   *
   * @returns {Function} The knex to be used.
   */
  static get knex() {
    return this._knex;
  }

  /**
   * Set the knex to be used and save it for future use.
   *
   * @param k {Function} Knex to be used.
   */
  static set knex(k) {
    this._knex = k;
  }
}

/**
 * @module
 * @type {Config}
 */
module.exports = Config;
