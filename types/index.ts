export interface ProductImage {
  id: number
  productId: number
  imageUrl: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  condition: string
  status: 'available' | 'reserved' | 'hidden' | 'sold'
  stock: number
  createdAt: string
  images: ProductImage[]
}

export interface CartItem {
  productId: number
  name: string
  price: number
  imageUrl: string
  quantity: number
  stock: number
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: number
  firstName: string
  lastName: string
  contact: string
  message: string
  totalAmount: number
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'refunded'
  createdAt: string
  items: OrderItem[]
}

export interface Reservation {
  id: number
  productId: number
  productName?: string
  firstName: string
  lastName: string
  contact: string
  message: string
  createdAt: string
  processed: boolean
}

export type ProductCondition =
  | 'comme neuf'
  | 'très bon état'
  | 'bon état'
  | 'état correct'

export type ProductStatus = 'available' | 'reserved' | 'hidden' | 'sold'
