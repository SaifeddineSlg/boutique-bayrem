'use client'

import { useState } from 'react'
import type { Product } from '@/types'

interface Props {
  product: Product
  onClose: () => void
  onSuccess: () => void
}

export default function ReservationModal({ product, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          ...form,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.')
      } else {
        onSuccess()
      }
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-xl">Je réserve ! 🎉</h2>
              <p className="text-white/80 text-sm mt-1 line-clamp-1">{product.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl leading-none"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full border-2 border-purple-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                placeholder="Léa"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full border-2 border-purple-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                placeholder="Dupont"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Contact (téléphone ou email) *
            </label>
            <input
              type="text"
              required
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="w-full border-2 border-purple-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              placeholder="06 12 34 56 78 ou email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Message (optionnel)
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              className="w-full border-2 border-purple-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm outline-none transition-colors resize-none"
              placeholder="Ex : Disponible lundi à la récréation, ou mardi après l'école..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
            💡 La réservation ne garantit pas définitivement l&apos;article tant que le
            rendez-vous n&apos;est pas confirmé. Paiement en espèces, remise en main
            propre aux Mureaux.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-extrabold py-3 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95"
          >
            {loading ? '⏳ Envoi en cours...' : '🎯 Envoyer ma réservation'}
          </button>
        </form>
      </div>
    </div>
  )
}
