/**
 * Contoh Penggunaan DB Query Builder
 */

// Contoh penggunaan dengan PostgreSQL
async function postgresExample(fastify) {
  console.log('=== Contoh PostgreSQL ===');
  
  // Set DB_ENGINE=pg di environment atau gunakan opsi dbEngine
  const qb = fastify.queryBuilder({ dbEngine: 'pg' });
  
  // Mengambil semua data
  const users = await qb.from('users').get();
  console.log('Semua user:', users);
  
  // Mengambil data dengan kondisi
  const activeUsers = await qb
    .from('users')
    .where('status', 'active')
    .where('age', '>', 18)
    .get();
  console.log('User aktif:', activeUsers);
  
  // Menyisipkan data
  const newUser = await qb
    .from('users')
    .insert({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      status: 'active'
    });
  console.log('User baru:', newUser);
  
  // Memperbarui data
  const updated = await qb
    .from('users')
    .where('id', newUser[0].id)
    .update({ name: 'John Updated' });
  console.log('Jumlah update:', updated);
  
  // Menghapus data
  const deleted = await qb
    .from('users')
    .where('id', newUser[0].id)
    .delete();
  console.log('Jumlah delete:', deleted);
}

// Contoh penggunaan dengan MongoDB
async function mongoExample(fastify) {
  console.log('=== Contoh MongoDB ===');
  
  // Set DB_ENGINE=mongodb di environment atau gunakan opsi dbEngine
  const qb = fastify.queryBuilder({ dbEngine: 'mongodb' });
  
  // Mengambil semua data
  const users = await qb.from('users').get();
  console.log('Semua user:', users);
  
  // Mengambil data dengan kondisi
  const activeUsers = await qb
    .from('users')
    .where('status', 'active')
    .where('age', '>', 18)
    .get();
  console.log('User aktif:', activeUsers);
  
  // Menyisipkan data
  const newUser = await qb
    .from('users')
    .insert({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      status: 'active'
    });
  console.log('User baru:', newUser);
  
  // Memperbarui data
  const updated = await qb
    .from('users')
    .where('_id', newUser._id)
    .update({ name: 'John Updated' });
  console.log('Jumlah update:', updated);
  
  // Menghapus data
  const deleted = await qb
    .from('users')
    .where('_id', newUser._id)
    .delete();
  console.log('Jumlah delete:', deleted);
}

// Fungsi untuk menjalankan contoh
async function runExamples(fastify) {
  try {
    // Jalankan contoh PostgreSQL
    await postgresExample(fastify);
    
    // Jalankan contoh MongoDB
    await mongoExample(fastify);
  } catch (error) {
    console.error('Error menjalankan contoh:', error);
  }
}

module.exports = runExamples; 