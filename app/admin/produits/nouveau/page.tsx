import Link from 'next/link'
import ProductForm from '../_components/ProductForm'

export default function NouveauProduitPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin/produits" className="text-gray-400 hover:text-white transition-colors">
          ← Produits
        </Link>
        <span className="text-gray-600">/</span>
        <h1 className="font-extrabold">Nouveau produit</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProductForm mode="create" />
      </div>
    </div>
  )
}
