'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Order } from '@/types'

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: '⏳ En attente',
  confirmed: '✅ Confirmée',
  delivered: '📦 Remise effectuée',
  cancelled: '❌ Annulée',
}

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  delivered: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all')

  async function fetchOrders() {
    const res = await fetch('/api/orders')
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  async function updateStatus(id: number, status: Order['status']) {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchOrders()
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)
  const pendingCount = orders.filter((o) => o.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
          ← Dashboard
        </Link>
        <span className="text-gray-600">/</span>
        <h1 className="font-extrabold">Commandes</h1>
        {pendingCount > 0 && (
          <span className="bg-yellow-400 text-gray-900 text-xs font-extrabold px-2 py-1 rounded-full">
            {pendingCount} en attente
          </span>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'pending', 'confirmed', 'delivered', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === f ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? `Toutes (${orders.length})` : STATUS_LABELS[f]}
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
            <p className="text-gray-500 font-semibold">Aucune commande ici.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <div key={order.id} className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${
                order.status === 'pending' ? 'border-yellow-400'
                : order.status === 'confirmed' ? 'border-green-400'
                : order.status === 'delivered' ? 'border-blue-400'
                : 'border-red-300'
              }`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="text-xs font-bold text-gray-400">#{order.id}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</p>
                        <p className="font-bold text-gray-800">{order.firstName} {order.lastName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
                        <p className="text-gray-700 text-sm">{order.contact}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</p>
                        <p className="font-extrabold text-purple-600">{order.totalAmount.toFixed(2)} €</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.productName} × {item.quantity}</span>
                          <span className="font-semibold text-gray-800">{(item.unitPrice * item.quantity).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>

                    {order.message && (
                      <p className="text-gray-500 text-sm italic mt-2">&ldquo;{order.message}&rdquo;</p>
                    )}
                  </div>

                  {/* Status actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(order.id, 'confirmed')}
                          className="text-xs font-semibold px-3 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                          ✅ Confirmer
                        </button>
                        <button onClick={() => updateStatus(order.id, 'cancelled')}
                          className="text-xs font-semibold px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                          ❌ Annuler
                        </button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <button onClick={() => updateStatus(order.id, 'delivered')}
                        className="text-xs font-semibold px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                        📦 Remise faite
                      </button>
                    )}
                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <button onClick={() => updateStatus(order.id, 'pending')}
                        className="text-xs font-semibold px-3 py-2 rounded-xl bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors">
                        ↩️ Rouvrir
                      </button>
                    )}
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
