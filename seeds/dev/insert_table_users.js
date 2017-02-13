exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('users').insert({ username: 'Tom Sawyer' }),
        knex('users').insert({ username: 'Mary Davis' }),
        knex('users').insert({ username: 'Kevin Lewis' }),
        knex('users').insert({ username: 'Jennifer Hall' })
      ]);
    });
};
