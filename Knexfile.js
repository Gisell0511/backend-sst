// knexfile.js
const path = require('path');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, './sst_database.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, './migrations')
    },
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      }
    }
  }
};