exports.development = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  seeds: {
    directory: './seeds/dev'
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  }
}
