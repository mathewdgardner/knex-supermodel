## knex-supermodel

[![circle](https://circleci.com/gh/mathewdgardner/knex-supermodel.svg?style=svg)](https://circleci.com/gh/mathewdgardner/knex-supermodel)
[![coverage](https://coveralls.io/repos/github/mathewdgardner/knex-supermodel/badge.svg?branch=master)](https://coveralls.io/github/mathewdgardner/knex-supermodel?branch=master)
[![npm](https://img.shields.io/npm/v/knex-supermodel.svg?maxAge=2592000)](https://www.npmjs.com/package/knex-supermodel)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/mathewdgardner/knex-supermodel/master/LICENSE)

## Description

knex-supermodel is meant to be a very lite but not quite an ORM for knex. This is accomplished by providing a base model that is simply an ES6 class that you extend in your own models. You can override the provided methods or even add to them to make your own. Each method will always return your model back to you, except in the obvious case of `collection`!

This package requires ES6 features only available in node 6.

## Static Examples

Each subclass will have automatic access to static methods to `create`, `fetch`, `collection`, `forge`, `update` and `destroy`.

### Create

When creating, the provided object becomes the properties. After inserting into the database, an instantation of your class is returned.

```javascript
let user;

User.create({ foo: 'bar' })
  .then((u) => {
    user = u;
  });
```

### Fetching

When fetching, the provided object becomes the `where` clause with a limit of 1. This results in an instantaion of your class whose properties are loaded from the database.

```javascript
let user;

User.fetch({ id: '123' })
  .then((u) => {
    user = u;
  });
```

### Forging

For convenience each model has access to a static `forge` method. Under the hood it is only calling the constructor and returing an instantiation of your class.

```javascript
const user = User.forge({ foo: 'bar', bar: 'baz' });

console.log(user.foo); // bar
console.log(user.bar); // baz
```

### Update

The static method `update` accepts new properties and a knex where clause object and returns to you instantiations of your class. It will return an array if there is more than one, otherwise it just give you the model updated. This is usefull if you are updating by ID.

```javascript
User.update({ foo: 'baz' }, { id: '123' })
  .then((user) => {
    console.log(user.foo); // baz
  });

User.update({ foo: 'baz' }, { foo: 'bar' })
  .then((users) => {
    console.log(user[0].foo); // baz
    console.log(user[1].foo); // baz
    console.log(user[2].foo); // baz
  });
```

## Destroy

The static method `destroy` accepts a knex where clause object to delete records.

```javascript
User.destroy({ foo: 'bar' }); // Deletes all users where foo is bar
```

### Collection

When getting a collection, the provided object becomes the `where` clause. Each member in the collection is an instantation of your class.

```javascript
let users;

User.collection({ foo: 'bar' })
  .then((u) => {
    users = u;
  });
```

## Instance Examples

### Saving

Any added properties will become part of the resultant query. By default, the method of saving is `insert` but you may provide `update` as well.

```javascript
class User extends require('knex-supermodel') {
  constructor(opts) {
    super(opts);
  }
}

User.knex = knex;
const user = new User({ foo: 'bar', bar: 'baz' });

console.log(user.foo); // bar
console.log(user.bar); // baz

user.save(); // performs insert
user.save({ method: 'insert' }); // performs insert
user.save({ method: 'update' }); // performs update
```

### Destroy

When deleting, it assumes you want to delete by `id` unless you provide an id object that is in the format of a knex where object.

```javascript
User.fetch({ id: '123' })
  .then((user) => {
    return user.destroy();
  });

User.fetch({ id: '123' })
  .then((user) => {
    return user.destroy({ foo: 'bar', bar: 'baz' });
  });
```

## Transacting

You may either provide a transacting knex to each method or chain it.

```javascript
let user;

knex.transaction((trx) => {
  User.fetch({ id: '123' }, { trx })
    .then((u) => {
      user = u;

      return user.update({ foo: 'baz' });
    });
});

knex.transaction((trx) => {
  user.transaction(trx)
    .update({ trx })
    .then((user) => {
      return user.update({ foo: 'baz' });
    });
});
```

## License

This software is licensed under [the MIT license](LICENSE.md).
