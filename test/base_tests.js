'use strict';

const Base = require('../lib/base');
const expect = require('chai').expect;
const knex = require('knex')(require('../knexfile'));
const Promise = require('bluebird');
const Sinon = require('sinon');
const Utils = require('./helpers/utils');

describe('Base', () => {
  class Model extends Base {}

  const properties = { foo: 'bar', bar: 'baz' };

  beforeEach(() => {
    Base.knex = null;
    return Utils.clear(knex);
  });

  describe('constructor', () => {
    it('should instantiate a model', () => {
      expect(new Model({}, { knex })).to.be.instanceOf(Model);
    });

    it('should instantiate a model with properties', () => {
      const model = new Model(properties, { knex });

      expect(model).to.be.instanceOf(Model);
      expect(model.foo).to.equal(properties.foo);
      expect(model.bar).to.equal(properties.bar);
    });

    it('should instantiate a model without a knex object', () => {
      expect(() => new Model()).to.not.throw(/knex/);
    });

    it('should instantiate a model with a knex object', () => {
      expect(() => new Model({}, { knex })).to.not.throw(/knex/);
    });
  });

  describe('properties', () => {
    it('should set a property', () => {
      const model = new Model();
      model.foo = 'bar';

      expect(model._properties.foo).to.equal('bar');
      expect(model._safeProperties.foo).to.equal('bar');
      expect(model.foo).to.equal('bar');
    });

    it('should set a property and keep a snake cased safe property', () => {
      const model = new Model();
      model.fooBar = 'baz';

      expect(model._properties.fooBar).to.equal('baz');
      expect(model._safeProperties.foo_bar).to.equal('baz');
      expect(model.fooBar).to.equal('baz');
    });

    it('should enter ownKeys trap and show user defined properties on the model', () => {
      const model = new Model({ foo: 'bar' });

      expect(Object.getOwnPropertyNames(model)).to.deep.equal([ 'foo' ]);
    });

    it('should enter deleteProperty trap and delete user defined properties on the model', () => {
      const model = new Model({ foo: 'bar' });
      delete model.foo;

      expect(model.foo).to.be.undefined;
    });
  });

  describe('static methods', () => {
    describe('get / set knex', () => {
      it('should get knex', () => {
        Model.knex = knex;
        const k = Model.knex;
        expect(k).to.equal(knex);
      });

      it('should set knex', () => {
        Model.knex = knex;
        expect(Model.knex).to.equal(knex);
      });
    });

    describe('create', () => {
      it('should create a new model and insert it into the database', () => {
        let model;

        return Model.create(properties, { knex })
          .then((m) => {
            model = m;

            expect(model).to.be.instanceOf(Model);

            return knex('models')
              .first()
              .where('id', model.id);
          })
          .then((m) => {
            expect(m).to.have.property('id', model.id);
            expect(m).to.have.property('foo', properties.foo);
            expect(m).to.have.property('bar', properties.bar);
          });
      });

      it('should create a new model and insert it into the database using a previously set knex', () => {
        Model.knex = knex;
        let model;

        return Model.create(properties)
          .then((m) => {
            model = m;

            expect(model).to.be.instanceOf(Model);

            return knex('models')
              .first()
              .where('id', model.id);
          })
          .then((m) => {
            expect(m).to.have.property('id', model.id);
            expect(m).to.have.property('foo', properties.foo);
            expect(m).to.have.property('bar', properties.bar);
          });
      });

      it('should not create a new model if no knex object is given', () => {
        expect(() => Model.create(properties)).to.throw(/knex/);
      });
    });

    describe('fetch', () => {
      it('should get a model', () => {
        return knex('models')
          .insert(properties, '*')
          .spread((m) => Model.fetch({ id: m.id }, { knex }))
          .then((model) => {
            expect(model).to.be.instanceOf(Model);
            expect(model.id).to.equal(model.id);
            expect(model.foo).to.equal(properties.foo);
            expect(model.bar).to.equal(properties.bar);
          });
      });

      it('should get a model using a previously set knex', () => {
        Model.knex = knex;

        return knex('models')
          .insert(properties, '*')
          .spread((m) => Model.fetch({ id: m.id }))
          .then((model) => {
            expect(model).to.be.instanceOf(Model);
            expect(model.id).to.equal(model.id);
            expect(model.foo).to.equal(properties.foo);
            expect(model.bar).to.equal(properties.bar);
          });
      });

      it('should not get model if no knex object is given', () => {
        expect(() => Model.fetch({ id: 'uuid' })).to.throw(/knex/);
      });
    });

    describe('collection', () => {
      beforeEach(() => {
        return knex('models')
          .insert([{
            foo: 'bar',
            bar: 'baz'
          }, {
            foo: 'bar2',
            bar: 'baz2'
          }, {
            foo: 'bar3',
            bar: 'baz3'
          }]);
      });

      it('should return a collection of models', () => {
        return Model.collection({}, { knex })
          .tap((models) => expect(models).to.have.property('length', 3))
          .map((model) => expect(model).to.be.instanceOf(Model));
      });

      it('should return a collection of models using previously set knex', () => {
        Model.knex = knex;

        return Model.collection({})
          .tap((models) => expect(models).to.have.property('length', 3))
          .map((model) => expect(model).to.be.instanceOf(Model));
      });

      it('should return a collection of models matching a given query', () => {
        return Model.collection({ foo: 'bar' }, { knex })
          .then((models) => {
            expect(models).to.have.property('length', 1);
          });
      });

      it('should return a collection of models with an empty query', () => {
        return Model.collection({}, { knex })
          .then((models) => {
            expect(models).to.have.property('length', 3);
          });
      });

      it('should return a collection of models with a null query', () => {
        return Model.collection(null, { knex })
          .then((models) => {
            expect(models).to.have.property('length', 3);
          });
      });
    });
  });

  describe('Instance methods', () => {
    describe('update', () => {
      const props = { foo: 'bar' };
      const newProperties = { foo: 'baz' };

      it('should update a model', () => {
        let model;

        return Model.create(properties, { knex })
          .then((m) => {
            model = m;

            return model.update(newProperties);
          })
          .then((m) => {
            expect(m).to.be.instanceOf(Model);
            expect(m.id).to.equal(model.id);
            expect(m.foo).to.equal(newProperties.foo);

            return knex('models')
              .first()
              .where('id', model.id);
          })
          .then((res) => {
            expect(res).to.have.property('id', model.id);
            expect(res).to.have.property('foo', newProperties.foo);
          });
      });

      it('should not update model if no knex object is given', () => {
        const model = new Model(props);

        expect(() => model.update(newProperties)).to.throw(/knex/);
      });
    });

    describe('save', () => {
      const props = { foo: 'bar' };

      it('should save a model', () => {
        const model = new Model(props);

        return model.save({ knex })
          .then((m) => {
            expect(m).to.be.instanceOf(Model);
            expect(m.id).to.exist;
            expect(m.created_at).to.exist;
            expect(m.updated_at).to.exist;
            expect(m.deleted_at).to.be.null;
            expect(m.foo).to.equal(props.foo);

            return knex('models')
              .first()
              .where('id', model.id);
          })
          .then((res) => {
            expect(res).to.have.property('id', model.id);
            expect(res).to.have.property('foo', props.foo);
          });
      });

      it('should save a model using previously set knex', () => {
        Model.knex = knex;
        const model = new Model(props);

        return model.save()
          .then((m) => {
            expect(m).to.be.instanceOf(Model);
            expect(m.id).to.exist;
            expect(m.created_at).to.exist;
            expect(m.updated_at).to.exist;
            expect(m.deleted_at).to.be.null;
            expect(m.foo).to.equal(props.foo);

            return knex('models')
              .first()
              .where('id', model.id);
          })
          .then((res) => {
            expect(res).to.have.property('id', model.id);
            expect(res).to.have.property('foo', props.foo);
          });
      });

      it('should not save model if no knex object is given', () => {
        const model = new Model(props);

        expect(() => model.save()).to.throw(/knex/);
      });
    });

    describe('destroy', () => {
      it('should delete a model', () => {
        return Model.create(properties, { knex })
          .then((model) => model.destroy())
          .then((model) => {
            expect(model).to.be.instanceOf(Model);

            return knex('models')
              .select()
              .where('id', model.id);
          })
          .then((res) => {
            expect(res).to.have.property('length', 0);
          });
      });

      it('should delete a model with provided query', () => {
        return Model.create(properties, { knex })
          .then((model) => model.destroy({ foo: 'bar' }))
          .then((model) => {
            expect(model).to.be.instanceOf(Model);

            return knex('models')
              .select()
              .where('id', model.id);
          })
          .then((res) => {
            expect(res).to.have.property('length', 0);
          });
      });

      it('should not delete a model if no knex object is given', () => {
        const model = new Model();
        expect(() => model.destroy()).to.throw(/knex/);
      });
    });

    describe('transaction', () => {
      it('should use a transaction', () => {
        return knex.transaction((trx) => {
          const model = new Model(properties, { trx });

          expect(model._trx).to.equal(trx);

          return model.save();
        })
        .then(() => {
          return knex('models')
            .select();
        })
        .then((res) => {
          expect(res).to.have.property('length', 1);
          expect(res[0]).to.have.property('foo', 'bar');
          expect(res[0]).to.have.property('bar', 'baz');
        });
      });

      it('should use a transaction through transaction method', () => {
        return knex.transaction((trx) => {
          const model = new Model(properties)
            .transaction(trx);

          expect(model._trx).to.equal(trx);

          return model.save();
        })
        .then(() => {
          return knex('models')
            .select();
        })
        .then((res) => {
          expect(res).to.have.property('length', 1);
          expect(res[0]).to.have.property('foo', 'bar');
          expect(res[0]).to.have.property('bar', 'baz');
        });
      });

      it('should rollback a transaction', () => {
        let saveStub;

        return knex.transaction((trx) => {
          const model = new Model(properties, { trx });
          saveStub = Sinon.stub(model, 'save')
            .returns(Promise.reject(new Error('rejected')));

          expect(model._trx).to.equal(trx);

          return model.save();
        })
        .then(() => {
          throw new Error('Should not get here!');
        })
        .catch((err) => {
          expect(err.message).to.equal('rejected');

          return knex('models')
            .select();
        })
        .then((res) => {
          expect(res).to.have.property('length', 0);
        })
        .finally(() => {
          saveStub.restore();
        });
      });
    });

    describe('toString', () => {
      it('should convert the model into a JSON string', () => {
        const model = new Model({ foo: 'bar', bar: 'baz' });
        expect(model.toString()).to.equal(JSON.stringify(model._properties));
      });
    });
  });
});
