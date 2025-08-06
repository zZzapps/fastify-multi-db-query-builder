# Fastify DB Query Builder

Query Builder untuk Fastify yang dapat mengkonversi query ke format yang sesuai dengan database engine yang digunakan (MongoDB atau SQL via Knex).

## Instalasi

```bash
npm install fastify-db-query-builder
```

## Registrasi Plugin

```javascript
const fastify = require('fastify')();

// Registrasi plugin
fastify.register(require('fastify-db-query-builder'), {
  decoratorName: 'queryBuilder', // default
  dbEngine: 'pg' // default, bisa 'mongodb', 'mysql', 'sqlite', 'mssql'
});
```

## Fitur

- ✅ Mendukung MongoDB dan SQL database (PostgreSQL, MySQL, SQLite, MSSQL) melalui Knex
- ✅ API yang konsisten untuk semua database engine
- ✅ Konversi otomatis query ke format yang sesuai
- ✅ Mendukung operasi dasar CRUD (Create, Read, Update, Delete)
- ✅ Plugin Fastify yang mudah digunakan
- ✅ Helper methods untuk database yang berbeda

## Cara Penggunaan

### 1. Query Builder Dasar

```javascript
// Menggunakan query builder dengan engine default
const users = await fastify.queryBuilder()
  .from('users')
  .where('status', 'active')
  .get();

// Menggunakan query builder dengan engine tertentu
const mongoUsers = await fastify.queryBuilder({ dbEngine: 'mongodb' })
  .from('users')
  .where('status', 'active')
  .get();
```

### 2. Helper Methods

```javascript
// Query untuk SQL database (PostgreSQL, MySQL, SQLite, MSSQL)
const sqlUsers = await fastify.db.sql('users')
  .where('status', 'active')
  .get();

// Query untuk MongoDB
const mongoUsers = await fastify.db.mongo('users')
  .where('status', 'active')
  .get();

// Query dengan engine default
const defaultUsers = await fastify.db.query('users')
  .where('status', 'active')
  .get();
```

### 3. Query dengan Engine Tertentu

```javascript
// Mendapatkan query builder dengan engine tertentu
const pgQuery = fastify.getQueryBuilder('pg');
const mongoQuery = fastify.getQueryBuilder('mongodb');

const users = await pgQuery.from('users').get();
const mongoUsers = await mongoQuery.from('users').get();
```

## API Reference

### Query Builder Methods

#### `from(tableName)`
Menentukan tabel atau koleksi yang akan digunakan.

```javascript
fastify.queryBuilder().from('users')
```

#### `where(field, operator, value)`
Menambahkan kondisi where.

```javascript
// Format 1: where(field, value)
fastify.queryBuilder().from('users').where('status', 'active')

// Format 2: where(field, operator, value)
fastify.queryBuilder().from('users').where('age', '>', 18)

// Format 3: where({field1: value1, field2: value2})
fastify.queryBuilder().from('users').where({status: 'active', age: 18})
```

#### `whereIn(field, values)`
Menambahkan kondisi where dengan operator IN.

```javascript
fastify.queryBuilder().from('users').whereIn('role', ['admin', 'user'])
```

#### `whereNotIn(field, values)`
Menambahkan kondisi where dengan operator NOT IN.

```javascript
fastify.queryBuilder().from('users').whereNotIn('role', ['admin'])
```

#### `whereLike(field, value)`
Menambahkan kondisi where dengan operator LIKE.

```javascript
fastify.queryBuilder().from('users').whereLike('name', '%john%')
```

#### `select(...fields)`
Menentukan field yang akan diambil.

```javascript
fastify.queryBuilder().from('users').select('id', 'name', 'email')
```

#### `orderBy(field, direction)`
Mengurutkan hasil query.

```javascript
fastify.queryBuilder().from('users').orderBy('created_at', 'desc')
```

#### `limit(limit)`
Membatasi jumlah hasil.

```javascript
fastify.queryBuilder().from('users').limit(10)
```

#### `skip(skip)` / `offset(offset)`
Melewati sejumlah hasil.

```javascript
fastify.queryBuilder().from('users').skip(20)
// atau
fastify.queryBuilder().from('users').offset(20)
```

### Execution Methods

#### `get()`
Mengeksekusi query dan mendapatkan semua hasil.

```javascript
const users = await fastify.queryBuilder().from('users').get()
```

#### `first()`
Mengeksekusi query dan mendapatkan hasil pertama.

```javascript
const user = await fastify.queryBuilder().from('users').where('id', 1).first()
```

#### `insert(data)`
Menyisipkan data baru.

```javascript
// Menyisipkan satu data
const newUser = await fastify.queryBuilder().from('users').insert({
  name: 'John Doe',
  email: 'john@example.com'
})

// Menyisipkan banyak data
const newUsers = await fastify.queryBuilder().from('users').insert([
  { name: 'John Doe', email: 'john@example.com' },
  { name: 'Jane Doe', email: 'jane@example.com' }
])
```

#### `update(data)`
Memperbarui data.

```javascript
const updatedCount = await fastify.queryBuilder()
  .from('users')
  .where('id', 1)
  .update({ name: 'John Updated' })
```

#### `delete()`
Menghapus data.

```javascript
const deletedCount = await fastify.queryBuilder()
  .from('users')
  .where('id', 1)
  .delete()
```

#### `count(field)`
Menghitung jumlah data.

```javascript
const userCount = await fastify.queryBuilder()
  .from('users')
  .where('status', 'active')
  .count()
```

#### `toSQL()` (hanya untuk SQL database)
Mendapatkan query SQL.

```javascript
const sql = fastify.queryBuilder()
  .from('users')
  .where('status', 'active')
  .toSQL()
console.log(sql) // SELECT * FROM "users" WHERE "status" = 'active'
```

## Konfigurasi

Query Builder akan menggunakan konfigurasi database yang sudah ada di aplikasi:

- Untuk MongoDB, menggunakan koneksi Mongoose yang sudah terdaftar di Fastify
- Untuk SQL database, menggunakan koneksi Knex yang sudah terdaftar di Fastify

### Environment Variables

```bash
# Database engine default
DB_ENGINE=pg # atau mongodb, mysql, sqlite, mssql

# Knex decorator name (jika menggunakan Knex)
DB_DECORATOR=db
```

## Contoh Penggunaan dalam Route

```javascript
// Route untuk mendapatkan semua user
fastify.get('/users', async (request, reply) => {
  try {
    const users = await fastify.queryBuilder()
      .from('users')
      .select('id', 'name', 'email')
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
```

## Dependencies

Library ini memerlukan dependencies berikut:

- `fastify` (peer dependency)
- `knex` (untuk SQL database)
- `mongoose` (untuk MongoDB)

## License

MIT 