const fs = require('fs');
const path = require('path');

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  // ✅ Force IPv4 DNS resolution (avoid IPv6 EHOSTUNREACH on Strapi Cloud)
  process.env.POSTGRES_HOST_ADDR_FAMILY = '4';

  // ✅ Optional toggle for local or pooled Supabase self-signed SSL
  if (env.bool('ALLOW_SELF_SIGNED_SSL', false)) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.log('⚠️  TLS certificate verification disabled (self-signed SSL allowed)');
  }

  console.log('🔒 Using SSL connection for Supabase');

  const connections = {
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'db.nkpfrrqajiirpqxewdlw.supabase.co'), // ✅ direct DB host
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'postgres'),
        user: env('DATABASE_USERNAME', 'postgres'),
        password: env('DATABASE_PASSWORD', ''),
        ssl: {
          require: true,
          rejectUnauthorized: false, // ✅ encrypted but ignores CA validation
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: 2, max: 10 },
    },

    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          '..',
          env('DATABASE_FILENAME', '.tmp/data.db')
        ),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
