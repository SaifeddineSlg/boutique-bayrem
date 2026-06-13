'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

export default function Header() {
  const { totalItems } = useCart()

  return (
    <header className="bg-gradient-to-r from-purple-500 via-pink-400 to-orange-400 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-4xl group-hover:animate-bounce transition-all">🎮</span>
          <div>
            <h1 className="text-white font-extrabold text-xl leading-tight drop-shadow-md">
              Les Petits Prix
            </h1>
            <p className="text-yellow-200 font-bold text-sm leading-tight drop-shadow">
              de Bayrem ⭐
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline bg-white/20 text-white rounded-full px-3 py-1 text-sm font-semibold backdrop-blur-sm">
            🏫 Aux Mureaux
          </span>
          <span className="bg-yellow-300 text-purple-700 rounded-full px-3 py-1 text-sm font-semibold">
            💰 Espèces uniquement
          </span>
          <Link
            href="/panier"
            className="relative bg-white/20 hover:bg-white/30 text-white rounded-full px-3 py-2 transition-all flex items-center gap-1 font-bold"
          >
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-purple-800 text-xs font-extrabold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
