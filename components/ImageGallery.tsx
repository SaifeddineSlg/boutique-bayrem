'use client'

import { useState } from 'react'
import type { ProductImage } from '@/types'

export default function ImageGallery({ images }: { images: ProductImage[] }) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) {
    return (
      <div className="w-full h-72 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center text-7xl">
        🎁
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative w-full h-72 bg-gray-100 rounded-3xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[current].imageUrl}
          alt={`Photo ${current + 1}`}
          className="w-full h-full object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-md text-lg transition-all"
            >
              ◀
            </button>
            <button
              onClick={() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-md text-lg transition-all"
            >
              ▶
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs rounded-full px-2 py-1">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-3 transition-all ${
                i === current
                  ? 'border-purple-500 ring-2 ring-purple-300'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
