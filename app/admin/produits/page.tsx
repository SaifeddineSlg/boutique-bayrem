import Link from 'next/link'
import { getAllProducts, deleteProduct } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import DeleteButton from './_components/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminProduitsPage() {
  const products = await getAllProducts()

  async function handleDelete(formData: FormData) {
    'use server'
    const id = parseInt(formData.get('id') as string)
    await deleteProduct(id)
    revalidatePath('/admin/produits')
    revalidatePath('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav title="Produits" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-gray-800">
            Tous les produits ({products.length})
          </h2>
          <Link
            href="/admin/produits/nouveau"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-2 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
          >
            ＋ Ajouter un produit
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 font-semibold">Aucun produit pour l&apos;instant.</p>
            <Link
              href="/admin/produits/nouveau"
              className="inline-block mt-4 bg-purple-500 text-white font-bold px-6 py-3 rounded-2xl hover:bg-purple-600 transition-all"
            >
              Ajouter le premier produit
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Produit</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Prix</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Stock</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">État</th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Statut</th>
                    <th className="text-right px-4 py-3 text-sm font-bold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-100 flex-shrink-0">
                            {product.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.images[0].imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">🎁</div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                            <p className="text-gray-400 text-xs">{product.images.length} photo(s)</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-purple-600">{product.price.toFixed(2)} €</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.stock === 0 ? 'bg-red-100 text-red-600' : product.stock <= 3 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.condition}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          product.status === 'available' ? 'bg-green-100 text-green-700'
                          : product.status === 'reserved' ? 'bg-red-100 text-red-700'
                          : product.status === 'sold' ? 'bg-gray-200 text-gray-700'
                          : 'bg-gray-100 text-gray-600'
                        }`}>
                          {product.status === 'available' ? '✅ Disponible'
                            : product.status === 'reserved' ? '🔒 Réservé'
                            : product.status === 'sold' ? '🏷️ Vendu'
                            : '👁️ Caché'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/produits/${product.id}`}
                            className="text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-xl transition-colors"
                          >
                            ✏️ Modifier
                          </Link>
                          <DeleteButton id={product.id} name={product.name} action={handleDelete} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminNav({ title }: { title: string }) {
  return (
    <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center gap-4">
      <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
        ← Dashboard
      </Link>
      <span className="text-gray-600">/</span>
      <h1 className="font-extrabold">{title}</h1>
    </header>
  )
}
