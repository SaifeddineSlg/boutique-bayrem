'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/contexts/CartContext'

export default function PanierPage() {
  const router = useRouter()
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart()
  const [form, setForm] = useState({ firstName: '', lastName: '', contact: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.')
      } else {
        clearCart()
        setSuccess(true)
      }
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Commande envoyée !</h2>
            <p className="text-gray-500 mb-6">
              Ta commande a bien été reçue. On te contactera pour confirmer le rendez-vous. 😊
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold py-3 rounded-2xl"
            >
              Retour à la boutique
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold mb-6"
        >
          ← Continuer mes achats
        </button>

        <h1 className="text-2xl font-extrabold text-gray-800 mb-6">🛒 Mon panier</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 font-semibold">Ton panier est vide.</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-2xl transition-all"
            >
              Voir les articles
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart items */}
            <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-100 flex-shrink-0">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{item.name}</p>
                    <p className="text-purple-600 font-extrabold">{item.price.toFixed(2)} € / unité</p>
                  </div>

                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-100 font-bold"
                    >
                      −
                    </button>
                    <span className="px-3 text-sm font-bold text-gray-700">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <p className="font-extrabold text-gray-800 flex-shrink-0 min-w-[60px] text-right">
                    {(item.price * item.quantity).toFixed(2)} €
                  </p>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-400 hover:text-red-600 text-xl flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-gray-500 font-semibold">Total</span>
                <span className="text-2xl font-extrabold text-purple-600">{totalPrice.toFixed(2)} €</span>
              </div>
            </div>

            {/* Checkout form */}
            <form onSubmit={handleOrder} className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
              <h2 className="font-extrabold text-gray-800 text-lg">📋 Tes coordonnées</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-2 outline-none"
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-2 outline-none"
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone ou email *</label>
                <input
                  type="text"
                  required
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-2 outline-none"
                  placeholder="06 12 34 56 78 ou email@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message (facultatif)</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-2 outline-none resize-none"
                  placeholder="Ex : Je suis disponible lundi après l'école."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-sm text-yellow-800">
                💰 Paiement en espèces lors de la remise en main propre aux Mureaux.
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-extrabold text-lg py-4 rounded-2xl transition-all"
              >
                {loading ? '⏳ Envoi en cours...' : '✅ Valider ma commande'}
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
