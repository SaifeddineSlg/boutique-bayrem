import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Administration — Les Petits Prix de Bayrem',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
