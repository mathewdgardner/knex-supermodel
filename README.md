## knex-supermodel

[![circle](https://circleci.com/gh/mathewdgardner/knex-supermodel.svg?style=svg)](https://circleci.com/gh/mathewdgardner/knex-supermodel)
[![coverage](https://coveralls.io/repos/github/mathewdgardner/knex-supermodel/badge.svg?branch=master)](https://coveralls.io/github/mathewdgardner/knex-supermodel?branch=master)
[![npm](https://img.shields.io/npm/v/knex-supermodel.svg?maxAge=2592000)](https://www.npmjs.com/package/knex-supermodel)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/mathewdgardner/knex-supermodel/master/LICENSE)

## Description

knex-supermodel is meant to be a very lite but not quite ORM for knex. This is accomplished by providing a base model that is simply an ES6 class that you extend in your own models. You can override the provided methods or even add to them to make your own. Each method will always return your model back to you, except in the obvious case of `collection`!

This package requires ES6 features only available in node 6.

## Examples

##### Saving

Any added properties will become part of the resultant query.

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
```

##### Fetching

When fetching, the provided object becomes the `where` clause with a limit of 1. This results in an instantaion of your class whose properties are loaded from the database.

```javascript
let user;

User.fetch({ id: '123' })
  .then((u) => {
    user = u;
  });
```

##### Collection

When getting a collection, the provided object becomes the `where` clause. Each member in the collection is an instantation of your class.

```javascript
let users;

User.collection({ foo: 'bar' })
  .then((u) => {
    users = u;
  });
```

##### Create

When creating, the provided object becomes the properties. After inserting into the database, an instantation of your class is returned.

```javascript
let user;

User.create({ foo: 'bar' })
  .then((u) => {
    user = u;
  });
```

##### Update

When updating, the provided object is used to update the record. The same instantation of your class is return after update with its properties updated.

```javascript
User.fetch({ id: '123' })
  .then((user) => {
    console.log(user.foo); // bar

    return user.update({ foo: 'baz' });
  })
  .then((user) => {
    console.log(user.foo); // baz
  });
```

##### Destroy

When deleting, it assumed you want to delete by `id` unless you provide an id object that is in the format of a knex where object.

```javascript
User.fetch({ id: '123' })
  .then((user) => {}
    return user.destroy();
  });

User.fetch({ id: '123' })
  .then((user) => {}
    return user.destroy({ foo: 'bar', bar: 'baz' });
  });
```

##### Transacting

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
