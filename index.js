/**
 * Fastify DB Query Builder Plugin
 * Query Builder yang dapat mengkonversi query ke format yang sesuai dengan database engine
 */

const fp = require('fastify-plugin');
const QueryBuilder = require('./lib/queryBuilder');

/**
 * Plugin untuk mendaftarkan query builder ke Fastify
 * @param {Object} fastify - Instance Fastify
 * @param {Object} options - Opsi plugin
 * @param {Function} done - Callback function
 */
async function dbQueryBuilder(fastify, options = {}, done) {
  // Opsi default
  const defaultOptions = {
    decoratorName: 'queryBuilder',
    dbEngine: process.env.DB_ENGINE || 'pg',
    ...options
  };

  // Mendaftarkan query builder sebagai decorator
  fastify.decorate(defaultOptions.decoratorName, (queryOptions = {}) => {
    return new QueryBuilder(fastify, {
      ...defaultOptions,
      ...queryOptions
    });
  });

  // Menambahkan helper method untuk mendapatkan query builder dengan engine tertentu
  fastify.decorate('getQueryBuilder', (dbEngine = null) => {
    return fastify[defaultOptions.decoratorName]({
      dbEngine: dbEngine || defaultOptions.dbEngine
    });
  });

  // Menambahkan helper method untuk query yang sering digunakan
  fastify.decorate('db', {
    // Query untuk PostgreSQL/MySQL/SQLite/MSSQL
    sql: (tableName) => {
      return fastify.getQueryBuilder('pg').from(tableName);
    },
    
    // Query untuk MongoDB
    mongo: (collectionName) => {
      return fastify.getQueryBuilder('mongodb').from(collectionName);
    },
    
    // Query dengan engine default
    query: (tableName) => {
      return fastify.getQueryBuilder().from(tableName);
    }
  });

  done();
}

// Export sebagai plugin Fastify
module.exports = fp(dbQueryBuilder, {
  name: 'fastify-db-query-builder',
  fastify: '4.x'
});

// Export kelas QueryBuilder untuk penggunaan langsung
module.exports.QueryBuilder = QueryBuilder; 