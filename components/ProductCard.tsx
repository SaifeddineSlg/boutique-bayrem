'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import type { Product } from '@/types'

const CONDITION_COLORS: Record<string, string> = {
  'comme neuf': 'bg-green-100 text-green-700',
  'très bon état': 'bg-blue-100 text-blue-700',
  'bon état': 'bg-yellow-100 text-yellow-700',
  'état correct': 'bg-orange-100 text-orange-700',
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const isSold = product.status === 'sold'
  const isReserved = product.status === 'reserved'
  const isUnavailable = isSold || isReserved
  const mainImage = product.images[0]?.imageUrl
  const cartItem = items.find((i) => i.productId === product.id)
  const remainingStock = product.stock - (cartItem?.quantity ?? 0)

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: mainImage || '',
        stock: product.stock,
      },
      qty
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className={`relative bg-white rounded-3xl shadow-md overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl ${isUnavailable ? 'opacity-75' : ''}`}>
      {/* Image */}
      <Link href={`/produits/${product.id}`} className="block">
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
          {mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🎁</div>
          )}

          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="bg-gray-700 text-white font-extrabold text-lg px-4 py-2 rounded-full shadow-lg rotate-[-5deg]">
                ✅ Vendu
              </span>
            </div>
          )}
          {isReserved && !isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="bg-red-500 text-white font-extrabold text-lg px-4 py-2 rounded-full shadow-lg rotate-[-5deg]">
                🔒 Réservé
              </span>
            </div>
          )}

          {product.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs rounded-full px-2 py-1">
              📷 {product.images.length}
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/produits/${product.id}`}>
          <h3 className="font-extrabold text-gray-800 text-base leading-tight mb-1 line-clamp-2 hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-extrabold text-purple-600">
            {product.price.toFixed(2)} €
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${CONDITION_COLORS[product.condition] || 'bg-gray-100 text-gray-600'}`}>
            {product.condition}
          </span>
        </div>

        {/* Stock indicator */}
        {!isUnavailable && (
          <p className={`text-xs font-semibold mb-3 ${remainingStock <= 3 ? 'text-orange-500' : 'text-gray-400'}`}>
            {remainingStock <= 0
              ? '⚠️ Plus de stock disponible'
              : remainingStock <= 3
              ? `⚡ Plus que ${remainingStock} disponible(s)`
              : `✅ ${remainingStock} en stock`}
          </p>
        )}

        {/* Add to cart */}
        {isUnavailable || remainingStock <= 0 ? (
          <div className="w-full text-center text-sm font-semibold text-gray-400 bg-gray-100 py-2 rounded-2xl">
            {isSold ? '✅ Vendu' : isReserved ? '🔒 Réservé' : '⚠️ Stock épuisé'}
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-2 py-1 text-gray-500 hover:bg-gray-100 font-bold transition-colors"
              >
                −
              </button>
              <span className="px-2 text-sm font-bold text-gray-700 min-w-[24px] text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(remainingStock, q + 1))}
                className="px-2 py-1 text-gray-500 hover:bg-gray-100 font-bold transition-colors"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              className={`flex-1 text-sm font-bold py-2 rounded-2xl transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
            >
              {added ? '✅ Ajouté !' : '🛒 Ajouter'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
