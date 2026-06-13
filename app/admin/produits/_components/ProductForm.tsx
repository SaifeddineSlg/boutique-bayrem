'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types'

interface Props {
  mode: 'create' | 'edit'
  product?: Product
}

const CONDITIONS = ['comme neuf', 'très bon état', 'bon état', 'état correct']

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    condition: product?.condition || 'bon état',
    status: product?.status || 'available',
    stock: product?.stock?.toString() || '1',
  })
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.images.map((i) => i.imageUrl) || ['']
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addImageUrl() {
    setImageUrls((prev) => [...prev, ''])
  }

  function removeImageUrl(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  function updateImageUrl(index: number, value: string) {
    setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)))
  }

  async function handleFileUpload(index: number, file: File) {
    return new Promise<void>((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        updateImageUrl(index, base64)
        resolve()
      }
      reader.readAsDataURL(file)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const validUrls = imageUrls.filter((url) => url.trim())

    try {
      const endpoint =
        mode === 'create' ? '/api/produits' : `/api/produits/${product!.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock) || 1,
          imageUrls: validUrls,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.')
      } else {
        router.push('/admin/produits')
        router.refresh()
      }
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product info */}
      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
        <h2 className="font-extrabold text-gray-800 text-lg">Informations du produit</h2>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nom du produit *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-2 outline-none transition-colors"
            placeholder="Ex : Jeu de construction LEGO"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-2 outline-none transition-colors resize-none"
            placeholder="Décris le produit en quelques mots..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Prix (€) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.50"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-2 outline-none transition-colors"
              placeholder="5.00"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Stock *
            </label>
            <input
              type="number"
              required
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-2 outline-none transition-colors"
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              État *
            </label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-2 outline-none transition-colors bg-white"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Statut *
          </label>
          <div className="flex gap-2 flex-wrap">
            {(['available', 'reserved', 'sold', 'hidden'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, status: s })}
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                  form.status === s
                    ? s === 'available'
                      ? 'bg-green-100 border-green-400 text-green-700'
                      : s === 'reserved'
                      ? 'bg-red-100 border-red-400 text-red-700'
                      : s === 'sold'
                      ? 'bg-gray-200 border-gray-500 text-gray-700'
                      : 'bg-gray-100 border-gray-400 text-gray-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {s === 'available' ? '✅ Disponible' : s === 'reserved' ? '🔒 Réservé' : s === 'sold' ? '🏷️ Vendu' : '👁️ Caché'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
        <h2 className="font-extrabold text-gray-800 text-lg">Photos du produit</h2>
        <p className="text-gray-500 text-sm">Colle une URL d&apos;image ou téléverse une photo depuis ton appareil.</p>

        <div className="space-y-3">
          {imageUrls.map((url, index) => (
            <div key={index} className="space-y-2">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={url.startsWith('data:') ? '' : url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  className="flex-1 border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                  placeholder={url.startsWith('data:') ? '📷 Fichier uploadé' : 'https://exemple.com/image.jpg'}
                />
                <label className="cursor-pointer text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl transition-colors whitespace-nowrap">
                  📁 Fichier
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) await handleFileUpload(index, file)
                    }}
                  />
                </label>
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="text-red-400 hover:text-red-600 text-xl leading-none"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Preview */}
              {url && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addImageUrl}
          className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1"
        >
          ＋ Ajouter une photo
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/produits')}
          className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-50 transition-all"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-extrabold py-3 rounded-2xl transition-all"
        >
          {loading
            ? '⏳ Enregistrement...'
            : mode === 'create'
            ? '✅ Créer le produit'
            : '✅ Enregistrer les modifications'}
        </button>
      </div>
    </form>
  )
}
