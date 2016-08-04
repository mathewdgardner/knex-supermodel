'use strict';

const expect = require('chai').expect;
const Util = require('../lib/util');

describe('Util', () => {
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
});
