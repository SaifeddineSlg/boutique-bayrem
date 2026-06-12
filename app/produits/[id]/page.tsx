'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ImageGallery from '@/components/ImageGallery'
import ReservationModal from '@/components/ReservationModal'
import type { Product } from '@/types'

const CONDITION_COLORS: Record<string, string> = {
  'comme neuf': 'bg-green-100 text-green-700 border-green-200',
  'très bon état': 'bg-blue-100 text-blue-700 border-blue-200',
  'bon état': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'état correct': 'bg-orange-100 text-orange-700 border-orange-200',
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [reserved, setReserved] = useState(false)

  useEffect(() => {
    fetch(`/api/produits/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) router.push('/')
        else setProduct(data)
      })
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">⏳</div>
            <p className="text-gray-500">Chargement...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) return null

  const isReserved = reserved || product.status === 'reserved'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold mb-6 transition-colors"
        >
          ← Retour à la boutique
        </button>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="md:grid md:grid-cols-2 gap-0">
            {/* Images */}
            <div className="p-6 bg-gray-50">
              <ImageGallery images={product.images} />
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                {/* Status */}
                <div className="mb-3">
                  {isReserved ? (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 border border-red-200 text-sm font-bold px-3 py-1 rounded-full">
                      🔒 Réservé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-600 border border-green-200 text-sm font-bold px-3 py-1 rounded-full">
                      ✅ Disponible
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="text-4xl font-extrabold text-purple-600 mb-4">
                  {product.price.toFixed(2)} €
                </div>

                {/* Condition */}
                <div className="mb-4">
                  <span
                    className={`inline-block text-sm font-semibold px-3 py-1 rounded-full border ${
                      CONDITION_COLORS[product.condition] || 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    État : {product.condition}
                  </span>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="bg-purple-50 rounded-2xl p-4 mb-4">
                    <h3 className="font-bold text-purple-700 mb-1 text-sm">📝 Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Info boxes */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-yellow-50 rounded-xl px-3 py-2">
                    <span>💰</span>
                    <span>Paiement uniquement en <strong>espèces</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-xl px-3 py-2">
                    <span>📍</span>
                    <span>Remise en main propre aux <strong>Mureaux</strong></span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              {isReserved ? (
                <div className="bg-gray-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl mb-2">😔</div>
                  <p className="text-gray-500 font-semibold">Cet article est déjà réservé.</p>
                  <p className="text-gray-400 text-sm mt-1">Consulte les autres articles disponibles !</p>
                  <button
                    onClick={() => router.push('/')}
                    className="mt-3 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-2xl transition-all"
                  >
                    Voir d&apos;autres articles
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold text-lg py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
                >
                  🎯 Je réserve cet article !
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showModal && (
        <ReservationModal
          product={product}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            setReserved(true)
          }}
        />
      )}

      {reserved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-[fadeIn_0.3s_ease-out]">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Réservation envoyée !</h2>
            <p className="text-gray-500 mb-6">
              Ton message a bien été envoyé. On te contactera pour confirmer le rendez-vous. 😊
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold py-3 rounded-2xl"
            >
              Retour à la boutique
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
