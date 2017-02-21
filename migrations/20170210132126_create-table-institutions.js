exports.up = function(knex, Promise) {

  const query = knex.schema.createTableIfNotExists('institutions', table => {
    table.increments('id').primary()
    table.string('inst_id').notNullable().unique()
    table.text('inst_name').notNullable()
  })

  return query

}

exports.down = function(knex, Promise) {

  const query = knex.schema.dropTableIfExists('institutions')

  return query

}
