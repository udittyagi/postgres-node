const { randomBytes } = require('crypto');
const format = require('pg-format');
const { default: migrate } = require('node-pg-migrate');
const pool = require('../pool');

const DEFAULT_OPTS = {
  host: 'localhost',
  port: 5432,
  database: 'socialnetwork-test',
  user: 'postgres',
  password: 'admin'
};

class Context {
  static async build() {
    // Randomly generating a role name to connect to PG as
    // We added a bcoz hex string might start with muber, which is an invalid identifier in postgres
    const roleName = 'a' + randomBytes(4).toString('hex');

    // Connect to PG as usual
    await pool.connect(DEFAULT_OPTS);

    // Create a new role
    await pool.query(
      format('CREATE ROLE %I WITH LOGIN PASSWORD %L;', roleName, roleName)
    );

    // Create a schema with the same name
    // authorization is given so that new role should not have any difficulty accesing the table in this schema
    await pool.query(
      format('CREATE SCHEMA %I AUTHORIZATION %I;', roleName, roleName)
    );

    // Disconnect entirely from PG
    await pool.close();

    // Run our migrations in the new schema
    await migrate({
      schema: roleName,
      direction: 'up',
      log: () => {},
      noLock: true,
      dir: 'migrations',
      databaseUrl: {
        host: 'localhost',
        port: 5432,
        database: 'socialnetwork-test',
        user: roleName,
        password: roleName,
      },
    });

    // Connect to PG as the newly created role
    await pool.connect({
      host: 'localhost',
      port: 5432,
      database: 'socialnetwork-test',
      user: roleName,
      password: roleName,
    });

    return new Context(roleName);
  }

  constructor(roleName) {
    this.roleName = roleName;
  }

  async reset() {
    /*
        We can reset mulitple tables as well
        await pool.query(`
            DELETE FROM users;
            DELETE FROM posts;
        `)
    */
    await pool.query(`
        DELETE FROM users;
    `)
  }

  async close() {
    // Disconnect from PG
    await pool.close();

    // Reconnect as our root user
    await pool.connect(DEFAULT_OPTS);

    // Delete the role and schema we created
    await pool.query(format('DROP SCHEMA %I CASCADE;', this.roleName));
    await pool.query(format('DROP ROLE %I;', this.roleName));

    // Disconnect
    await pool.close();
  }
}

module.exports = Context;