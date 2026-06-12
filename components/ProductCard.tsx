import Link from 'next/link'
import type { Product } from '@/types'

const CONDITION_COLORS: Record<string, string> = {
  'comme neuf': 'bg-green-100 text-green-700',
  'très bon état': 'bg-blue-100 text-blue-700',
  'bon état': 'bg-yellow-100 text-yellow-700',
  'état correct': 'bg-orange-100 text-orange-700',
}

export default function ProductCard({ product }: { product: Product }) {
  const isReserved = product.status === 'reserved'
  const mainImage = product.images[0]?.imageUrl

  return (
    <Link href={`/produits/${product.id}`} className="group block">
      <div
        className={`
          relative bg-white rounded-3xl shadow-md overflow-hidden
          transition-all duration-300 ease-out
          group-hover:-translate-y-2 group-hover:shadow-xl
          ${isReserved ? 'opacity-75' : ''}
        `}
      >
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
          {mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🎁
            </div>
          )}

          {/* Reserved badge */}
          {isReserved && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="bg-red-500 text-white font-extrabold text-lg px-4 py-2 rounded-full shadow-lg rotate-[-5deg]">
                🔒 Réservé
              </span>
            </div>
          )}

          {/* Photo count */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs rounded-full px-2 py-1">
              📷 {product.images.length}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-extrabold text-gray-800 text-lg leading-tight mb-1 line-clamp-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-extrabold text-purple-600">
              {product.price.toFixed(2)} €
            </span>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                CONDITION_COLORS[product.condition] || 'bg-gray-100 text-gray-600'
              }`}
            >
              {product.condition}
            </span>
          </div>

          <div className="mt-3">
            {isReserved ? (
              <div className="w-full text-center text-sm font-semibold text-gray-400 bg-gray-100 py-2 rounded-2xl">
                Déjà réservé
              </div>
            ) : (
              <div className="w-full text-center text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 py-2 rounded-2xl group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                Voir & Réserver 🛒
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
