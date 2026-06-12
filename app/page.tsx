import { getAllProducts } from '@/lib/db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const products = await getAllProducts()
  const visible = products.filter((p) => p.status !== 'hidden')
  const available = visible.filter((p) => p.status === 'available')
  const reserved = visible.filter((p) => p.status === 'reserved')

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

          {/* Info banners */}
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

        {/* Products */}
        {visible.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🏪</div>
            <h3 className="text-xl font-bold text-gray-600">La boutique est vide pour l&apos;instant</h3>
            <p className="text-gray-400 mt-2">Revenez bientôt pour voir les nouvelles offres !</p>
          </div>
        ) : (
          <>
            {/* Available products */}
            {available.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-extrabold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="bg-green-500 text-white rounded-full px-3 py-1 text-sm">
                    ✅ Disponibles
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {available.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Reserved products */}
            {reserved.length > 0 && (
              <section>
                <h2 className="text-xl font-extrabold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="bg-red-400 text-white rounded-full px-3 py-1 text-sm">
                    🔒 Déjà réservés
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {reserved.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
