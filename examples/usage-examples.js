/**
 * Contoh Penggunaan Fastify DB Query Builder
 */

// Contoh penggunaan dalam route handler
async function userRoutes(fastify, options) {
  // Route untuk mendapatkan semua user
  fastify.get('/users', async (request, reply) => {
    try {
      // Menggunakan query builder dengan engine default
      const users = await fastify.queryBuilder()
        .from('users')
        .select('id', 'name', 'email', 'status')
        .where('status', 'active')
        .orderBy('created_at', 'desc')
        .limit(10)
        .get();

      return { success: true, data: users };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Route untuk mendapatkan user berdasarkan ID
  fastify.get('/users/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      const user = await fastify.queryBuilder()
        .from('users')
        .where('id', id)
        .first();

      if (!user) {
        reply.code(404);
        return { success: false, error: 'User tidak ditemukan' };
      }

      return { success: true, data: user };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Route untuk membuat user baru
  fastify.post('/users', async (request, reply) => {
    try {
      const userData = request.body;
      
      const newUser = await fastify.queryBuilder()
        .from('users')
        .insert(userData);

      reply.code(201);
      return { success: true, data: newUser };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Route untuk memperbarui user
  fastify.put('/users/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;
      
      const updatedCount = await fastify.queryBuilder()
        .from('users')
        .where('id', id)
        .update(updateData);

      if (updatedCount === 0) {
        reply.code(404);
        return { success: false, error: 'User tidak ditemukan' };
      }

      return { success: true, message: 'User berhasil diperbarui' };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Route untuk menghapus user
  fastify.delete('/users/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      const deletedCount = await fastify.queryBuilder()
        .from('users')
        .where('id', id)
        .delete();

      if (deletedCount === 0) {
        reply.code(404);
        return { success: false, error: 'User tidak ditemukan' };
      }

      return { success: true, message: 'User berhasil dihapus' };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });
}

// Contoh penggunaan dengan database yang berbeda
async function multiDbExample(fastify, options) {
  // Route untuk data dari PostgreSQL
  fastify.get('/sql-users', async (request, reply) => {
    try {
      const users = await fastify.db.sql('users')
        .where('status', 'active')
        .get();

      return { success: true, data: users };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Route untuk data dari MongoDB
  fastify.get('/mongo-users', async (request, reply) => {
    try {
      const users = await fastify.db.mongo('users')
        .where('status', 'active')
        .get();

      return { success: true, data: users };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Route untuk query dengan engine tertentu
  fastify.get('/users/:engine', async (request, reply) => {
    try {
      const { engine } = request.params;
      
      const users = await fastify.getQueryBuilder(engine)
        .from('users')
        .where('status', 'active')
        .get();

      return { success: true, data: users };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });
}

// Contoh penggunaan advanced query
async function advancedQueryExample(fastify, options) {
  // Route untuk query dengan multiple conditions
  fastify.get('/advanced-users', async (request, reply) => {
    try {
      const { status, age, roles } = request.query;
      
      let query = fastify.queryBuilder()
        .from('users')
        .select('id', 'name', 'email', 'age', 'status', 'role');

      // Menambahkan kondisi berdasarkan parameter
      if (status) {
        query = query.where('status', status);
      }

      if (age) {
        query = query.where('age', '>=', parseInt(age));
      }

      if (roles) {
        const roleArray = roles.split(',');
        query = query.whereIn('role', roleArray);
      }

      const users = await query
        .orderBy('created_at', 'desc')
        .limit(20)
        .get();

      return { success: true, data: users };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Route untuk mendapatkan statistik
  fastify.get('/user-stats', async (request, reply) => {
    try {
      const totalUsers = await fastify.queryBuilder()
        .from('users')
        .count();

      const activeUsers = await fastify.queryBuilder()
        .from('users')
        .where('status', 'active')
        .count();

      const inactiveUsers = await fastify.queryBuilder()
        .from('users')
        .where('status', 'inactive')
        .count();

      return {
        success: true,
        data: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers
        }
      };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });
}

module.exports = {
  userRoutes,
  multiDbExample,
  advancedQueryExample
}; 