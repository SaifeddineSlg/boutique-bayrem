import { createClient, type Client } from '@libsql/client'
import type { Product, ProductImage, Reservation } from '@/types'

let client: Client | null = null
let initialized = false

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:local.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return client
}

async function initDb(db: Client): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL,
      description TEXT  DEFAULT '',
      price     REAL    NOT NULL,
      condition TEXT    NOT NULL DEFAULT 'bon état',
      status    TEXT    NOT NULL DEFAULT 'available',
      created_at TEXT   DEFAULT (datetime('now'))
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_images (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_url  TEXT    NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS reservations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      first_name TEXT    NOT NULL,
      last_name  TEXT    NOT NULL,
      contact    TEXT    NOT NULL,
      message    TEXT    DEFAULT '',
      created_at TEXT    DEFAULT (datetime('now')),
      processed  INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `)
}

export async function getDb(): Promise<Client> {
  const db = getClient()
  if (!initialized) {
    await initDb(db)
    initialized = true
  }
  return db
}

// ─── Products ────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb()

  const productsResult = await db.execute(
    'SELECT * FROM products ORDER BY created_at DESC'
  )

  const imagesResult = await db.execute(
    'SELECT * FROM product_images'
  )

  const images = imagesResult.rows as unknown as Array<{
    id: number; product_id: number; image_url: string
  }>

  return (productsResult.rows as unknown as Array<{
    id: number; name: string; description: string; price: number;
    condition: string; status: string; created_at: string
  }>).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    condition: row.condition,
    status: row.status as 'available' | 'reserved',
    createdAt: row.created_at,
    images: images
      .filter((img) => img.product_id === row.id)
      .map((img) => ({ id: img.id, productId: img.product_id, imageUrl: img.image_url })),
  }))
}

export async function getProductById(id: number): Promise<Product | null> {
  const db = await getDb()

  const productResult = await db.execute({
    sql: 'SELECT * FROM products WHERE id = ?',
    args: [id],
  })

  if (productResult.rows.length === 0) return null

  const row = productResult.rows[0] as unknown as {
    id: number; name: string; description: string; price: number;
    condition: string; status: string; created_at: string
  }

  const imagesResult = await db.execute({
    sql: 'SELECT * FROM product_images WHERE product_id = ?',
    args: [id],
  })

  const images = (imagesResult.rows as unknown as Array<{
    id: number; product_id: number; image_url: string
  }>).map((img) => ({ id: img.id, productId: img.product_id, imageUrl: img.image_url }))

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    condition: row.condition,
    status: row.status as 'available' | 'reserved',
    createdAt: row.created_at,
    images,
  }
}

export async function createProduct(data: {
  name: string
  description: string
  price: number
  condition: string
  status: string
  imageUrls: string[]
}): Promise<Product> {
  const db = await getDb()

  const result = await db.execute({
    sql: 'INSERT INTO products (name, description, price, condition, status) VALUES (?, ?, ?, ?, ?)',
    args: [data.name, data.description, data.price, data.condition, data.status],
  })

  const productId = Number(result.lastInsertRowid)

  for (const url of data.imageUrls) {
    if (url.trim()) {
      await db.execute({
        sql: 'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
        args: [productId, url.trim()],
      })
    }
  }

  return (await getProductById(productId))!
}

export async function updateProduct(
  id: number,
  data: {
    name: string
    description: string
    price: number
    condition: string
    status: string
    imageUrls: string[]
  }
): Promise<Product | null> {
  const db = await getDb()

  await db.execute({
    sql: 'UPDATE products SET name=?, description=?, price=?, condition=?, status=? WHERE id=?',
    args: [data.name, data.description, data.price, data.condition, data.status, id],
  })

  // Replace images
  await db.execute({ sql: 'DELETE FROM product_images WHERE product_id=?', args: [id] })
  for (const url of data.imageUrls) {
    if (url.trim()) {
      await db.execute({
        sql: 'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
        args: [id, url.trim()],
      })
    }
  }

  return getProductById(id)
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb()
  await db.execute({ sql: 'DELETE FROM products WHERE id=?', args: [id] })
}

// ─── Reservations ────────────────────────────────────────────

export async function getAllReservations(): Promise<Reservation[]> {
  const db = await getDb()
  const result = await db.execute(`
    SELECT r.*, p.name as product_name
    FROM reservations r
    LEFT JOIN products p ON r.product_id = p.id
    ORDER BY r.created_at DESC
  `)

  return (result.rows as unknown as Array<{
    id: number; product_id: number; product_name: string;
    first_name: string; last_name: string; contact: string;
    message: string; created_at: string; processed: number
  }>).map((row) => ({
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    firstName: row.first_name,
    lastName: row.last_name,
    contact: row.contact,
    message: row.message,
    createdAt: row.created_at,
    processed: Boolean(row.processed),
  }))
}

export async function createReservation(data: {
  productId: number
  firstName: string
  lastName: string
  contact: string
  message: string
}): Promise<void> {
  const db = await getDb()
  await db.execute({
    sql: 'INSERT INTO reservations (product_id, first_name, last_name, contact, message) VALUES (?, ?, ?, ?, ?)',
    args: [data.productId, data.firstName, data.lastName, data.contact, data.message],
  })
  // Mark product as reserved
  await db.execute({
    sql: "UPDATE products SET status='reserved' WHERE id=?",
    args: [data.productId],
  })
}

export async function markReservationProcessed(id: number, processed: boolean): Promise<void> {
  const db = await getDb()
  await db.execute({
    sql: 'UPDATE reservations SET processed=? WHERE id=?',
    args: [processed ? 1 : 0, id],
  })
}

export async function deleteReservation(id: number): Promise<void> {
  const db = await getDb()
  const result = await db.execute({ sql: 'SELECT product_id FROM reservations WHERE id=?', args: [id] })
  const productId = result.rows[0]?.product_id
  await db.execute({ sql: 'DELETE FROM reservations WHERE id=?', args: [id] })
  if (productId) {
    await db.execute({ sql: "UPDATE products SET status='available' WHERE id=?", args: [productId] })
  }
}
