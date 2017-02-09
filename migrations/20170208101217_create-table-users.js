exports.up = function(knex, Promise) {

  const query = knex.schema.createTableIfNotExists('users', table => {
    table.increments('id').primary()
    table.string('username').notNullable().unique()
    table.specificType('inst_ids', 'text[]')
    table.specificType('tokens', 'text[]')
  })

  return query

}

exports.down = function(knex, Promise) {

  const query = knex.schema.dropTableIfExists('users')

  return query

}
