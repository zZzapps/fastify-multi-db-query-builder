/**
 * Query Builder
 * Kelas untuk membuat query database yang dapat bekerja dengan berbagai engine
 */

const MongoAdapter = require('./adapters/mongoAdapter');
const KnexAdapter = require('./adapters/knexAdapter');

class QueryBuilder {
  constructor(fastify, options = {}) {
    this.fastify = fastify;
    this.options = options;
    this.table = null;
    this.collection = null;
    this.conditions = [];
    this.fields = [];
    this.sorts = {};
    this.limitValue = null;
    this.skipValue = null;
    this.adapter = null;
    this.dbEngine = options.dbEngine || process.env.DB_ENGINE || 'pg';
    
    // Inisialisasi adapter berdasarkan engine database
    this._initAdapter();
  }

  /**
   * Inisialisasi adapter berdasarkan engine database
   * @private
   */
  _initAdapter() {
    if (this.dbEngine === 'mongodb' || this.dbEngine === 'mongo') {
      this.adapter = new MongoAdapter(this.fastify);
    } else {
      // Untuk PostgreSQL, MySQL, SQLite, MSSQL menggunakan Knex
      this.adapter = new KnexAdapter(this.fastify, this.dbEngine);
    }
  }

  /**
   * Menentukan tabel atau koleksi yang akan digunakan
   * @param {string} tableName - Nama tabel atau koleksi
   * @returns {QueryBuilder} - Instance query builder
   */
  from(tableName) {
    this.table = tableName;
    this.collection = tableName;
    return this;
  }

  /**
   * Menambahkan kondisi where
   * @param {string|object} field - Field atau objek kondisi
   * @param {string} operator - Operator perbandingan (opsional)
   * @param {any} value - Nilai untuk dibandingkan (opsional)
   * @returns {QueryBuilder} - Instance query builder
   */
  where(field, operator, value) {
    // Handle berbagai format where
    if (typeof field === 'object') {
      // Format: where({field1: value1, field2: value2})
      Object.keys(field).forEach(key => {
        this.conditions.push({
          field: key,
          operator: '=',
          value: field[key]
        });
      });
    } else if (value === undefined) {
      // Format: where(field, value)
      this.conditions.push({
        field,
        operator: '=',
        value: operator
      });
    } else {
      // Format: where(field, operator, value)
      this.conditions.push({
        field,
        operator,
        value
      });
    }
    return this;
  }

  /**
   * Menambahkan kondisi where dengan operator IN
   * @param {string} field - Field yang akan dicek
   * @param {Array} values - Array nilai yang akan dicek
   * @returns {QueryBuilder} - Instance query builder
   */
  whereIn(field, values) {
    this.conditions.push({
      field,
      operator: 'in',
      value: values
    });
    return this;
  }

  /**
   * Menambahkan kondisi where dengan operator NOT IN
   * @param {string} field - Field yang akan dicek
   * @param {Array} values - Array nilai yang akan dicek
   * @returns {QueryBuilder} - Instance query builder
   */
  whereNotIn(field, values) {
    this.conditions.push({
      field,
      operator: 'not in',
      value: values
    });
    return this;
  }

  /**
   * Menambahkan kondisi where dengan operator LIKE
   * @param {string} field - Field yang akan dicek
   * @param {string} value - Nilai yang akan dicari
   * @returns {QueryBuilder} - Instance query builder
   */
  whereLike(field, value) {
    this.conditions.push({
      field,
      operator: 'like',
      value
    });
    return this;
  }

  /**
   * Menentukan field yang akan diambil
   * @param  {...string} fields - Field yang akan diambil
   * @returns {QueryBuilder} - Instance query builder
   */
  select(...fields) {
    this.fields = fields.flat();
    return this;
  }

  /**
   * Mengurutkan hasil query
   * @param {string} field - Field untuk pengurutan
   * @param {string} direction - Arah pengurutan (asc/desc)
   * @returns {QueryBuilder} - Instance query builder
   */
  orderBy(field, direction = 'asc') {
    this.sorts[field] = direction.toLowerCase();
    return this;
  }

  /**
   * Membatasi jumlah hasil
   * @param {number} limit - Jumlah maksimum hasil
   * @returns {QueryBuilder} - Instance query builder
   */
  limit(limit) {
    this.limitValue = limit;
    return this;
  }

  /**
   * Melewati sejumlah hasil
   * @param {number} skip - Jumlah hasil yang dilewati
   * @returns {QueryBuilder} - Instance query builder
   */
  skip(skip) {
    this.skipValue = skip;
    return this;
  }

  /**
   * Alias untuk skip
   * @param {number} offset - Jumlah hasil yang dilewati
   * @returns {QueryBuilder} - Instance query builder
   */
  offset(offset) {
    return this.skip(offset);
  }

  /**
   * Mengeksekusi query dan mendapatkan semua hasil
   * @returns {Promise<Array>} - Hasil query
   */
  async get() {
    return this.adapter.get(this);
  }

  /**
   * Mengeksekusi query dan mendapatkan hasil pertama
   * @returns {Promise<Object>} - Hasil query
   */
  async first() {
    const originalLimit = this.limitValue;
    this.limitValue = 1;
    const results = await this.adapter.get(this);
    this.limitValue = originalLimit;
    return results[0] || null;
  }

  /**
   * Menyisipkan data baru
   * @param {Object|Array} data - Data yang akan disisipkan
   * @returns {Promise<Object|Array>} - Data yang disisipkan dengan ID
   */
  async insert(data) {
    return this.adapter.insert(this, data);
  }

  /**
   * Memperbarui data
   * @param {Object} data - Data yang akan diperbarui
   * @returns {Promise<number>} - Jumlah baris yang diperbarui
   */
  async update(data) {
    return this.adapter.update(this, data);
  }

  /**
   * Menghapus data
   * @returns {Promise<number>} - Jumlah baris yang dihapus
   */
  async delete() {
    return this.adapter.delete(this);
  }

  /**
   * Menghitung jumlah data
   * @param {string} field - Field untuk dihitung (default: *)
   * @returns {Promise<number>} - Jumlah data
   */
  async count(field = '*') {
    return this.adapter.count(this, field);
  }

  /**
   * Mendapatkan query SQL (hanya untuk SQL database)
   * @returns {string} - Query SQL
   */
  toSQL() {
    if (this.adapter.constructor.name === 'KnexAdapter') {
      const query = this.adapter._buildQuery(this);
      return query.toString();
    }
    throw new Error('toSQL() hanya tersedia untuk SQL database');
  }
}

module.exports = QueryBuilder; 