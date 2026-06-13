import { NextRequest, NextResponse } from 'next/server'
import { getAllReservations } from '@/lib/db'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const reservations = await getAllReservations()
    return NextResponse.json(reservations)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
