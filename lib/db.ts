import { createClient, type Client } from '@libsql/client'
import type { Product, ProductImage, Reservation, Order, OrderItem } from '@/types'

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
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      price       REAL    NOT NULL,
      condition   TEXT    NOT NULL DEFAULT 'bon état',
      status      TEXT    NOT NULL DEFAULT 'available',
      stock       INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT    DEFAULT (datetime('now'))
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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name     TEXT    NOT NULL,
      last_name      TEXT    NOT NULL,
      contact        TEXT    NOT NULL,
      message        TEXT    DEFAULT '',
      total_amount   REAL    NOT NULL DEFAULT 0,
      status         TEXT    NOT NULL DEFAULT 'pending',
      payment_status TEXT    NOT NULL DEFAULT 'unpaid',
      created_at     TEXT    DEFAULT (datetime('now'))
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id     INTEGER NOT NULL,
      product_id   INTEGER NOT NULL,
      product_name TEXT    NOT NULL,
      quantity     INTEGER NOT NULL,
      unit_price   REAL    NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
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

function mapProduct(
  row: { id: number; name: string; description: string; price: number; condition: string; status: string; stock: number; created_at: string },
  images: Array<{ id: number; product_id: number; image_url: string }>
): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    condition: row.condition,
    status: row.status as Product['status'],
    stock: row.stock ?? 1,
    createdAt: row.created_at,
    images: images
      .filter((img) => img.product_id === row.id)
      .map((img) => ({ id: img.id, productId: img.product_id, imageUrl: img.image_url })),
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb()

  const [productsResult, imagesResult] = await Promise.all([
    db.execute('SELECT * FROM products ORDER BY created_at DESC'),
    db.execute('SELECT * FROM product_images'),
  ])

  const images = imagesResult.rows as unknown as Array<{
    id: number; product_id: number; image_url: string
  }>

  return (productsResult.rows as unknown as Array<{
    id: number; name: string; description: string; price: number;
    condition: string; status: string; stock: number; created_at: string
  }>).map((row) => mapProduct(row, images))
}

export async function getProductById(id: number): Promise<Product | null> {
  const db = await getDb()

  const [productResult, imagesResult] = await Promise.all([
    db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] }),
    db.execute({ sql: 'SELECT * FROM product_images WHERE product_id = ?', args: [id] }),
  ])

  if (productResult.rows.length === 0) return null

  const row = productResult.rows[0] as unknown as {
    id: number; name: string; description: string; price: number;
    condition: string; status: string; stock: number; created_at: string
  }
  const images = imagesResult.rows as unknown as Array<{
    id: number; product_id: number; image_url: string
  }>

  return mapProduct(row, images)
}

export async function createProduct(data: {
  name: string
  description: string
  price: number
  condition: string
  status: string
  stock: number
  imageUrls: string[]
}): Promise<Product> {
  const db = await getDb()

  const result = await db.execute({
    sql: 'INSERT INTO products (name, description, price, condition, status, stock) VALUES (?, ?, ?, ?, ?, ?)',
    args: [data.name, data.description, data.price, data.condition, data.status, data.stock],
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
    stock: number
    imageUrls: string[]
  }
): Promise<Product | null> {
  const db = await getDb()

  await db.execute({
    sql: 'UPDATE products SET name=?, description=?, price=?, condition=?, status=?, stock=? WHERE id=?',
    args: [data.name, data.description, data.price, data.condition, data.status, data.stock, id],
  })

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

// ─── Orders ──────────────────────────────────────────────────

export async function createOrder(data: {
  firstName: string
  lastName: string
  contact: string
  message: string
  items: Array<{ productId: number; quantity: number }>
}): Promise<{ success: boolean; error?: string; orderId?: number }> {
  const db = await getDb()
  const tx = await db.transaction('write')

  try {
    // Verify stock for each item atomically
    for (const item of data.items) {
      const result = await tx.execute({
        sql: 'SELECT id, name, price, stock, status FROM products WHERE id = ?',
        args: [item.productId],
      })

      if (result.rows.length === 0) {
        await tx.rollback()
        return { success: false, error: `Produit introuvable (id: ${item.productId})` }
      }

      const product = result.rows[0] as unknown as {
        id: number; name: string; price: number; stock: number; status: string
      }

      if (product.status === 'sold' || product.status === 'hidden') {
        await tx.rollback()
        return { success: false, error: `"${product.name}" n'est plus disponible.` }
      }

      if (product.stock < item.quantity) {
        await tx.rollback()
        const remaining = product.stock
        return {
          success: false,
          error: remaining === 0
            ? `"${product.name}" n'est plus disponible ou le stock a changé. Veuillez mettre à jour votre panier.`
            : `"${product.name}" : seulement ${remaining} disponible(s).`,
        }
      }
    }

    // Compute total
    let totalAmount = 0
    const enrichedItems: Array<{ productId: number; name: string; price: number; quantity: number }> = []

    for (const item of data.items) {
      const result = await tx.execute({
        sql: 'SELECT name, price FROM products WHERE id = ?',
        args: [item.productId],
      })
      const row = result.rows[0] as unknown as { name: string; price: number }
      totalAmount += row.price * item.quantity
      enrichedItems.push({ productId: item.productId, name: row.name, price: row.price, quantity: item.quantity })
    }

    // Insert order
    const orderResult = await tx.execute({
      sql: 'INSERT INTO orders (first_name, last_name, contact, message, total_amount) VALUES (?, ?, ?, ?, ?)',
      args: [data.firstName, data.lastName, data.contact, data.message, totalAmount],
    })
    const orderId = Number(orderResult.lastInsertRowid)

    // Insert items and decrement stock
    for (const item of enrichedItems) {
      await tx.execute({
        sql: 'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
        args: [orderId, item.productId, item.name, item.quantity, item.price],
      })

      // Decrement stock
      await tx.execute({
        sql: 'UPDATE products SET stock = stock - ? WHERE id = ?',
        args: [item.quantity, item.productId],
      })

      // Auto-set status to sold if stock reaches 0
      await tx.execute({
        sql: "UPDATE products SET status = 'sold' WHERE id = ? AND stock <= 0",
        args: [item.productId],
      })
    }

    await tx.commit()
    return { success: true, orderId }
  } catch (err) {
    await tx.rollback()
    throw err
  }
}

export async function getAllOrders(): Promise<Order[]> {
  const db = await getDb()

  const [ordersResult, itemsResult] = await Promise.all([
    db.execute('SELECT * FROM orders ORDER BY created_at DESC'),
    db.execute('SELECT * FROM order_items'),
  ])

  const allItems = itemsResult.rows as unknown as Array<{
    id: number; order_id: number; product_id: number; product_name: string;
    quantity: number; unit_price: number
  }>

  return (ordersResult.rows as unknown as Array<{
    id: number; first_name: string; last_name: string; contact: string;
    message: string; total_amount: number; status: string; payment_status: string; created_at: string
  }>).map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    contact: row.contact,
    message: row.message,
    totalAmount: row.total_amount,
    status: row.status as Order['status'],
    paymentStatus: row.payment_status as Order['paymentStatus'],
    createdAt: row.created_at,
    items: allItems
      .filter((i) => i.order_id === row.id)
      .map((i) => ({
        id: i.id,
        orderId: i.order_id,
        productId: i.product_id,
        productName: i.product_name,
        quantity: i.quantity,
        unitPrice: i.unit_price,
      })),
  }))
}

export async function updateOrderStatus(
  id: number,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
): Promise<void> {
  const db = await getDb()
  if (paymentStatus) {
    await db.execute({
      sql: 'UPDATE orders SET status=?, payment_status=? WHERE id=?',
      args: [status, paymentStatus, id],
    })
  } else {
    await db.execute({
      sql: 'UPDATE orders SET status=? WHERE id=?',
      args: [status, id],
    })
  }
}

// ─── Reservations (legacy) ────────────────────────────────────

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
