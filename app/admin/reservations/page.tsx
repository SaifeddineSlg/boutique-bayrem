'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Reservation } from '@/types'

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed'>('all')

  async function fetchReservations() {
    const res = await fetch('/api/reservations')
    if (res.ok) {
      const data = await res.json()
      setReservations(data)
    }
    setLoading(false)
  }

  useEffect(() => { fetchReservations() }, [])

  async function toggleProcessed(id: number, processed: boolean) {
    await fetch(`/api/reservations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ processed }),
    })
    await fetchReservations()
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette réservation ?')) return
    await fetch(`/api/reservations/${id}`, { method: 'DELETE' })
    await fetchReservations()
  }

  const filtered = reservations.filter((r) => {
    if (filter === 'pending') return !r.processed
    if (filter === 'processed') return r.processed
    return true
  })

  const pendingCount = reservations.filter((r) => !r.processed).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
          ← Dashboard
        </Link>
        <span className="text-gray-600">/</span>
        <h1 className="font-extrabold">Réservations</h1>
        {pendingCount > 0 && (
          <span className="bg-yellow-400 text-gray-900 text-xs font-extrabold px-2 py-1 rounded-full">
            {pendingCount} en attente
          </span>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'processed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === f
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {f === 'all' ? `Toutes (${reservations.length})`
               : f === 'pending' ? `⏳ En attente (${pendingCount})`
               : `✅ Traitées (${reservations.length - pendingCount})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3 animate-bounce">⏳</div>
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 font-semibold">Aucune réservation ici.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => (
              <div
                key={r.id}
                className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${
                  r.processed ? 'border-green-400' : 'border-yellow-400'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          r.processed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {r.processed ? '✅ Traitée' : '⏳ En attente'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Article</p>
                        <p className="font-bold text-gray-800">{r.productName || `Produit #${r.productId}`}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</p>
                        <p className="font-bold text-gray-800">{r.firstName} {r.lastName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
                        <p className="text-gray-700">{r.contact}</p>
                      </div>
                      {r.message && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</p>
                          <p className="text-gray-700 text-sm italic">&ldquo;{r.message}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleProcessed(r.id, !r.processed)}
                      className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                        r.processed
                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {r.processed ? '↩️ Rouvrir' : '✅ Marquer traitée'}
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-xs font-semibold px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
