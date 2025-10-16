const fs = require('fs');
const path = require('path');

// ✅ Global override: allow self-signed certs (Supabase pooled SSL)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  console.log('🔒 Using unverified SSL connection for Supabase (encrypted but CA ignored)');

  const connections = {
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'aws-1-us-east-1.pooler.supabase.com'),
        port: env.int('DATABASE_PORT', 6543),
        database: env('DATABASE_NAME', 'postgres'),
        user: env('DATABASE_USERNAME', 'postgres'),
        password: env('DATABASE_PASSWORD', ''),
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: 2, max: 10 },
    },

    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
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
