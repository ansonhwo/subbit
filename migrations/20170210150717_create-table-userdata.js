exports.up = function(knex, Promise) {

  const query = knex.schema.createTableIfNotExists('userdata', table => {
    table.increments('id').primary()
    table.string('username').notNullable()
    table.string('inst_id').notNullable()
    table.string('token', 1000).notNullable()
    table.foreign('username').references('users.username')
    table.foreign('inst_id').references('institutions.inst_id')
  })

  return query

}

exports.down = function(knex, Promise) {

  const query = knex.schema.dropTableIfExists('userdata')

  return query

}
