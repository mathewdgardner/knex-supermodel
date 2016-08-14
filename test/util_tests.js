'use strict';

const Base = require('../lib/base');
const expect = require('chai').expect;
const Util = require('../lib/util');

describe('Util', () => {
  class Model extends Base {}

  describe('toCamel', () => {
    it('should convert an object to camelCase', () => {
      expect(Util.toCamel({ foo_bar: 'baz' })).to.deep.equal({ fooBar: 'baz' });
    });

    it('should preserve a camelCase object as camelCase', () => {
      expect(Util.toCamel({ fooBar: 'baz' })).to.deep.equal({ fooBar: 'baz' });
    });
  });

  describe('toSnake', () => {
    it('should convert an object to snake_case', () => {
      expect(Util.toSnake({ fooBar: 'baz' })).to.deep.equal({ foo_bar: 'baz' });
    });

    it('should preserve a snake_case object as snake_case', () => {
      expect(Util.toSnake({ foo_bar: 'baz' })).to.deep.equal({ foo_bar: 'baz' });
    });
  });

  describe('table', () => {
    it('should return table from static context', () => {
      expect(Util.table(Model)).to.equal('models');
    });

    it('should return table from instance context', () => {
      const model = new Model();
      expect(Util.table(model)).to.equal('models');
    });
  });
});
