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
  status: 'available' | 'reserved'
  createdAt: string
  images: ProductImage[]
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

export type ProductStatus = 'available' | 'reserved'
