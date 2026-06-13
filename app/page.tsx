import { getAllProducts } from '@/lib/db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductsGrid from '@/components/ProductsGrid'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const products = await getAllProducts()
  const visible = products.filter((p) => p.status !== 'hidden')
  const available = visible.filter((p) => p.status === 'available')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎮 🧸 🎯</div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-3">
            Bienvenue dans la boutique de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              Bayrem !
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Ici tu peux trouver des jeux, jouets et accessoires à{' '}
            <strong className="text-purple-600">petit prix</strong>. 🎉
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-full px-4 py-2 text-sm font-semibold">
              💰 Paiement en espèces
            </div>
            <div className="bg-blue-100 border border-blue-300 text-blue-800 rounded-full px-4 py-2 text-sm font-semibold">
              📍 Remise en main propre aux Mureaux
            </div>
            <div className="bg-green-100 border border-green-300 text-green-800 rounded-full px-4 py-2 text-sm font-semibold">
              ✅ {available.length} article{available.length !== 1 ? 's' : ''} disponible{available.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <ProductsGrid products={visible} />
      </main>

      <Footer />
    </div>
  )
}
