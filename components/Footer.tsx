export default function Footer() {
  return (
    <footer className="mt-16 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div>
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-bold text-yellow-300 mb-1">Paiement</h3>
            <p className="text-white/80 text-sm">Uniquement en espèces.</p>
          </div>
          <div>
            <div className="text-2xl mb-2">📍</div>
            <h3 className="font-bold text-yellow-300 mb-1">
              Remise en main propre
            </h3>
            <p className="text-white/80 text-sm">
              Aux Mureaux (école Émile Zola ou rendez-vous convenu).
            </p>
          </div>
          <div>
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-bold text-yellow-300 mb-1">Réservation</h3>
            <p className="text-white/80 text-sm">
              La réservation ne garantit pas l'article tant que le rendez-vous
              n'est pas confirmé.
            </p>
          </div>
        </div>
        <p className="text-center text-white/50 text-xs mt-8">
          © {new Date().getFullYear()} Les Petits Prix de Bayrem — fait avec ❤️
        </p>
      </div>
    </footer>
  )
}
