/**
 * Knex Adapter
 * Adapter untuk mengkonversi query ke format SQL menggunakan Knex
 */

class KnexAdapter {
  constructor(fastify, dbEngine) {
    this.fastify = fastify;
    this.dbEngine = dbEngine || 'pg';
    
    // Mendapatkan instance knex dari fastify
    if (!this.fastify.knex || !this.fastify.knex[process.env.DB_DECORATOR || 'db']) {
      throw new Error('Knex instance tidak ditemukan di fastify');
    }
    
    this.knex = this.fastify.knex[process.env.DB_DECORATOR || 'db'];
  }

  /**
   * Membangun query knex berdasarkan query builder
   * @param {QueryBuilder} builder - Instance query builder
   * @returns {Object} - Query knex
   */
  _buildQuery(builder) {
    let query = this.knex(builder.table);

    // Menerapkan kondisi where
    if (builder.conditions.length > 0) {
      builder.conditions.forEach(condition => {
        const { field, operator, value } = condition;
        
        switch (operator) {
          case 'in':
            query = query.whereIn(field, value);
            break;
          case 'not in':
            query = query.whereNotIn(field, value);
            break;
          case 'like':
            query = query.where(field, 'like', value);
            break;
          default:
            query = query.where(field, operator, value);
        }
      });
    }

    // Menerapkan field yang akan diambil
    if (builder.fields.length > 0) {
      query = query.select(builder.fields);
    }

    // Menerapkan pengurutan
    if (Object.keys(builder.sorts).length > 0) {
      Object.keys(builder.sorts).forEach(field => {
        query = query.orderBy(field, builder.sorts[field]);
      });
    }

    // Menerapkan limit dan offset
    if (builder.limitValue !== null) {
      query = query.limit(builder.limitValue);
    }

    if (builder.skipValue !== null) {
      query = query.offset(builder.skipValue);
    }

    return query;
  }

  /**
   * Mengambil data
   * @param {QueryBuilder} builder - Instance query builder
   * @returns {Promise<Array>} - Hasil query
   */
  async get(builder) {
    const query = this._buildQuery(builder);
    return await query;
  }

  /**
   * Menyisipkan data baru
   * @param {QueryBuilder} builder - Instance query builder
   * @param {Object|Array} data - Data yang akan disisipkan
   * @returns {Promise<Object|Array>} - Data yang disisipkan dengan ID
   */
  async insert(builder, data) {
    const query = this.knex(builder.table);
    
    if (Array.isArray(data)) {
      return await query.insert(data).returning('*');
    } else {
      return await query.insert(data).returning('*');
    }
  }

  /**
   * Memperbarui data
   * @param {QueryBuilder} builder - Instance query builder
   * @param {Object} data - Data yang akan diperbarui
   * @returns {Promise<number>} - Jumlah baris yang diperbarui
   */
  async update(builder, data) {
    const query = this._buildQuery(builder);
    return await query.update(data);
  }

  /**
   * Menghapus data
   * @param {QueryBuilder} builder - Instance query builder
   * @returns {Promise<number>} - Jumlah baris yang dihapus
   */
  async delete(builder) {
    const query = this._buildQuery(builder);
    return await query.delete();
  }

  /**
   * Menghitung jumlah data
   * @param {QueryBuilder} builder - Instance query builder
   * @param {string} field - Field untuk dihitung
   * @returns {Promise<number>} - Jumlah data
   */
  async count(builder, field) {
    const query = this._buildQuery(builder);
    const result = await query.count({ count: field });
    return parseInt(result[0].count, 10);
  }
}

module.exports = KnexAdapter; 