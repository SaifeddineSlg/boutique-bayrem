'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'
import type { Product } from '@/types'

type Filter = 'all' | 'available' | 'reserved' | 'sold'

export default function ProductsGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const counts = {
    all: products.length,
    available: products.filter((p) => p.status === 'available').length,
    reserved: products.filter((p) => p.status === 'reserved').length,
    sold: products.filter((p) => p.status === 'sold').length,
  }

  const filtered = filter === 'all' ? products : products.filter((p) => p.status === filter)

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-7xl mb-4">🏪</div>
        <h3 className="text-xl font-bold text-gray-600">La boutique est vide pour l&apos;instant</h3>
        <p className="text-gray-400 mt-2">Revenez bientôt pour voir les nouvelles offres !</p>
      </div>
    )
  }

  const FILTERS: { key: Filter; label: string; color: string; activeColor: string }[] = [
    { key: 'all', label: `Tous (${counts.all})`, color: 'bg-white border-gray-200 text-gray-600', activeColor: 'bg-purple-500 border-purple-500 text-white' },
    { key: 'available', label: `✅ Disponibles (${counts.available})`, color: 'bg-white border-gray-200 text-gray-600', activeColor: 'bg-green-500 border-green-500 text-white' },
    { key: 'reserved', label: `🔒 Réservés (${counts.reserved})`, color: 'bg-white border-gray-200 text-gray-600', activeColor: 'bg-red-400 border-red-400 text-white' },
    { key: 'sold', label: `✅ Vendus (${counts.sold})`, color: 'bg-white border-gray-200 text-gray-600', activeColor: 'bg-gray-500 border-gray-500 text-white' },
  ]

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
              filter === f.key ? f.activeColor : f.color + ' hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-400 font-semibold">Aucun article dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  )
}
