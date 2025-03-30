const path = require('path');

module.exports = ({ env }) => ({
  connection: {
    client: env('DATABASE_CLIENT', 'mysql2'),
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 3306),
      database: env('DATABASE_NAME', 'incidencias_db'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', '123456'),
      ssl: env.bool('DATABASE_SSL', false) ? {
        key: env('DATABASE_SSL_KEY'),
        cert: env('DATABASE_SSL_CERT'),
        ca: env('DATABASE_SSL_CA'),
        capath: env('DATABASE_SSL_CAPATH'),
        cipher: env('DATABASE_SSL_CIPHER'),
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
      } : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
  },
});
