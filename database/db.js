const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgres://postgres:tem16270@qbbeta.cnzxvde8gomm.us-east-1.rds.amazonaws.com:5432/qbbeta",
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;
