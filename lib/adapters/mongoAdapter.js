/**
 * MongoDB Adapter
 * Adapter untuk mengkonversi query ke format MongoDB
 */

class MongoAdapter {
  constructor(fastify) {
    this.fastify = fastify;
    
    // Memastikan mongoose tersedia
    if (!this.fastify.mongoose) {
      throw new Error('Mongoose instance tidak ditemukan di fastify');
    }
  }

  /**
   * Mengkonversi operator ke operator MongoDB
   * @param {string} operator - Operator dari query builder
   * @returns {string} - Operator MongoDB
   */
  _convertOperator(operator) {
    const operatorMap = {
      '=': '$eq',
      '!=': '$ne',
      '<>': '$ne',
      '>': '$gt',
      '>=': '$gte',
      '<': '$lt',
      '<=': '$lte',
      'like': '$regex',
      'in': '$in',
      'not in': '$nin'
    };

    return operatorMap[operator] || '$eq';
  }

  /**
   * Membangun filter MongoDB berdasarkan kondisi
   * @param {Array} conditions - Kondisi dari query builder
   * @returns {Object} - Filter MongoDB
   */
  _buildFilter(conditions) {
    const filter = {};

    conditions.forEach(condition => {
      const { field, operator, value } = condition;
      const mongoOperator = this._convertOperator(operator);

      if (mongoOperator === '$regex' && typeof value === 'string') {
        // Menangani operator LIKE dengan mengubah % menjadi regex
        const regexValue = value.replace(/%/g, '.*');
        filter[field] = { [mongoOperator]: new RegExp(regexValue, 'i') };
      } else {
        filter[field] = { [mongoOperator]: value };
      }
    });

    return filter;
  }

  /**
   * Membangun opsi MongoDB berdasarkan query builder
   * @param {QueryBuilder} builder - Instance query builder
   * @returns {Object} - Opsi MongoDB
   */
  _buildOptions(builder) {
    const options = {};

    // Menerapkan projection (fields)
    if (builder.fields.length > 0) {
      options.projection = {};
      builder.fields.forEach(field => {
        options.projection[field] = 1;
      });
    }

    // Menerapkan pengurutan
    if (Object.keys(builder.sorts).length > 0) {
      options.sort = {};
      Object.keys(builder.sorts).forEach(field => {
        options.sort[field] = builder.sorts[field] === 'asc' ? 1 : -1;
      });
    }

    // Menerapkan limit dan skip
    if (builder.limitValue !== null) {
      options.limit = builder.limitValue;
    }

    if (builder.skipValue !== null) {
      options.skip = builder.skipValue;
    }

    return options;
  }

  /**
   * Mendapatkan koleksi MongoDB
   * @param {string} collectionName - Nama koleksi
   * @returns {Object} - Koleksi MongoDB
   */
  _getCollection(collectionName) {
    const db = this.fastify.mongoose.connection.db;
    return db.collection(collectionName);
  }

  /**
   * Mengambil data
   * @param {QueryBuilder} builder - Instance query builder
   * @returns {Promise<Array>} - Hasil query
   */
  async get(builder) {
    const collection = this._getCollection(builder.collection);
    const filter = this._buildFilter(builder.conditions);
    const options = this._buildOptions(builder);

    return await collection.find(filter, options).toArray();
  }

  /**
   * Menyisipkan data baru
   * @param {QueryBuilder} builder - Instance query builder
   * @param {Object|Array} data - Data yang akan disisipkan
   * @returns {Promise<Object|Array>} - Data yang disisipkan dengan ID
   */
  async insert(builder, data) {
    const collection = this._getCollection(builder.collection);
    
    if (Array.isArray(data)) {
      const result = await collection.insertMany(data);
      return result.ops || data;
    } else {
      const result = await collection.insertOne(data);
      return result.ops?.[0] || { ...data, _id: result.insertedId };
    }
  }

  /**
   * Memperbarui data
   * @param {QueryBuilder} builder - Instance query builder
   * @param {Object} data - Data yang akan diperbarui
   * @returns {Promise<number>} - Jumlah dokumen yang diperbarui
   */
  async update(builder, data) {
    const collection = this._getCollection(builder.collection);
    const filter = this._buildFilter(builder.conditions);
    
    const result = await collection.updateMany(filter, { $set: data });
    return result.modifiedCount || 0;
  }

  /**
   * Menghapus data
   * @param {QueryBuilder} builder - Instance query builder
   * @returns {Promise<number>} - Jumlah dokumen yang dihapus
   */
  async delete(builder) {
    const collection = this._getCollection(builder.collection);
    const filter = this._buildFilter(builder.conditions);
    
    const result = await collection.deleteMany(filter);
    return result.deletedCount || 0;
  }

  /**
   * Menghitung jumlah data
   * @param {QueryBuilder} builder - Instance query builder
   * @returns {Promise<number>} - Jumlah data
   */
  async count(builder) {
    const collection = this._getCollection(builder.collection);
    const filter = this._buildFilter(builder.conditions);
    
    return await collection.countDocuments(filter);
  }
}

module.exports = MongoAdapter; 