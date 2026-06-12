import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Les Petits Prix de Bayrem — Jeux et jouets pour enfants aux Mureaux',
  description:
    'Boutique de Bayrem : jeux, jouets et accessoires pour enfants à petit prix. Paiement en espèces, remise en main propre aux Mureaux.',
  keywords: 'jouets, jeux, enfants, petits prix, Mureaux, Bayrem',
  openGraph: {
    title: 'Les Petits Prix de Bayrem',
    description: 'Jeux et jouets à petit prix aux Mureaux',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
