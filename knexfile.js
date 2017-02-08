exports.development = {
  client: 'postgresql',
  connection: {
    user: 'super',
    database: 'subbit'
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  }
}
