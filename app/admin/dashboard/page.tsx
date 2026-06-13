import Link from 'next/link'
import { getAllProducts, getAllOrders } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [products, orders] = await Promise.all([
    getAllProducts(),
    getAllOrders(),
  ])

  const availableCount = products.filter((p) => p.status === 'available').length
  const soldCount = products.filter((p) => p.status === 'sold').length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚙️</span>
          <div>
            <h1 className="font-extrabold text-lg">Administration</h1>
            <p className="text-gray-400 text-xs">Les Petits Prix de Bayrem</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="text-gray-300 hover:text-white text-sm transition-colors">
            🌐 Voir le site
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Tableau de bord</h2>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard emoji="📦" label="Total produits" value={products.length} color="bg-purple-100 text-purple-700" />
          <StatCard emoji="✅" label="Disponibles" value={availableCount} color="bg-green-100 text-green-700" />
          <StatCard emoji="🏷️" label="Vendus" value={soldCount} color="bg-gray-100 text-gray-700" />
          <StatCard emoji="📋" label="Commandes en attente" value={pendingOrders} color="bg-yellow-100 text-yellow-700" />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/produits"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center gap-4 group"
          >
            <div className="text-4xl group-hover:scale-110 transition-transform">📦</div>
            <div>
              <h3 className="font-extrabold text-gray-800">Gérer les produits</h3>
              <p className="text-gray-500 text-sm">Ajouter, modifier, supprimer des articles</p>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-purple-400 text-xl">→</span>
          </Link>

          <Link
            href="/admin/commandes"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center gap-4 group"
          >
            <div className="text-4xl group-hover:scale-110 transition-transform">📋</div>
            <div>
              <h3 className="font-extrabold text-gray-800">Voir les commandes</h3>
              <p className="text-gray-500 text-sm">
                {pendingOrders > 0
                  ? `${pendingOrders} en attente de traitement`
                  : 'Toutes traitées ✅'}
              </p>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-purple-400 text-xl">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  emoji, label, value, color,
}: { emoji: string; label: string; value: number; color: string }) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="text-xs font-semibold opacity-80 mt-1">{label}</div>
    </div>
  )
}

function LogoutButton() {
  return (
    <form action="/api/admin/logout" method="POST">
      <button
        type="submit"
        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
      >
        Déconnexion
      </button>
    </form>
  )
}
