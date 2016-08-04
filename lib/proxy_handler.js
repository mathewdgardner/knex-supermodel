'use strict';

const _ = require('lodash');

/**
 * Proxy handler for keeping user defined properties of a model on a dedicated object, _properties.
 */
module.exports = {
  /**
   * Own keys trap for the proxy.
   *
   * @param {Object} target The model.
   * @returns {Array} User defined property keys on the model.
   */
  ownKeys(target) {
    return Object.keys(target._properties);
  },

  /**
   * Get trap for the proxy.
   *
   * @param {Object} target The model.
   * @param {String} property The requested property name.
   * @returns {*} The property requested.
   */
  get(target, property) {
    if (typeof target[property] !== 'undefined') {
      return target[property];
    }

    return target._properties[property];
  },

  /**
   * Set trap for the proxy.
   *
   * @param {Object} target The model.
   * @param {String} property The requested property name.
   * @param {*} value The value to set.
   * @returns {boolean} The value is accepted or rejected.
   */
  set(target, property, value) {
    if (property.startsWith('_')) {
      target[property] = value;

      return true;
    }

    target._properties[property] = value;
    target._safeProperties[_.snakeCase(property)] = value;

    return true;
  },

  /**
   * Delete trap for the proxy.
   *
   * @param {Object} target The model.
   * @param {String} property The requested property name.
   * @returns {boolean} The value was deleted or not.
   */
  deleteProperty(target, property) {
    delete target._properties[property];
    delete target._safeProperties[property];

    return true;
  }
};
