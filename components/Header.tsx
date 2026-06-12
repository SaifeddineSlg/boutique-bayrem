import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-500 via-pink-400 to-orange-400 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-4xl group-hover:animate-bounce transition-all">
            🎮
          </span>
          <div>
            <h1 className="text-white font-extrabold text-xl leading-tight drop-shadow-md">
              Les Petits Prix
            </h1>
            <p className="text-yellow-200 font-bold text-sm leading-tight drop-shadow">
              de Bayrem ⭐
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-white text-sm font-semibold">
          <span className="hidden sm:inline bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
            🏫 École Emile Zola• Aux Mureaux Ou rendez-vous convenu
          </span>
          <span className="bg-yellow-300 text-purple-700 rounded-full px-3 py-1">
            💰 Espèces uniquement
          </span>
        </div>
      </div>
    </header>
  )
}
