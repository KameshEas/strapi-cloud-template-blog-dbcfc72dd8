const fs = require('fs');
const path = require('path');

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  let caCert;

  try {
    const caPath = env('DATABASE_SSL_CA')
      ? path.resolve(__dirname, '..', env('DATABASE_SSL_CA'))
      : path.resolve(__dirname, '..', '.certs/prod-ca-2021.crt'); 

    if (fs.existsSync(caPath)) {
      caCert = fs.readFileSync(caPath);
      console.log(`✅ Loaded SSL certificate from file: ${caPath}`);
    } else if (env('DATABASE_SSL_CA_BASE64')) {
      caCert = Buffer.from(env('DATABASE_SSL_CA_BASE64'), 'base64');
      console.log('✅ Loaded SSL certificate from Base64 environment variable');
    } else {
      console.warn('⚠️ No SSL certificate found — falling back to unverified SSL');
    }
  } catch (err) {
    console.error('❌ Failed to load SSL certificate:', err.message);
  }

  const connections = {
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'aws-1-us-east-1.pooler.supabase.com'),
        port: env.int('DATABASE_PORT', 6543),
        database: env('DATABASE_NAME', 'postgres'),
        user: env('DATABASE_USERNAME', 'postgres'),
        password: env('DATABASE_PASSWORD', ''),
        ssl: env.bool('DATABASE_SSL', true)
          ? caCert
            ? { ca: caCert, rejectUnauthorized: true } 
            : { require: true, rejectUnauthorized: false } 
          : false,
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
