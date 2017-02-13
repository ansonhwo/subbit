exports.development = {
  client: 'postgresql',
  connection: {
    user: 'super',
    database: 'subbit'
  },
  seeds: {
    directory: './seeds/dev'
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  }
}
