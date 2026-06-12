import { NextRequest, NextResponse } from 'next/server'
import { getAllReservations, createReservation, getProductById } from '@/lib/db'
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, firstName, lastName, contact, message } = body

    if (!productId || !firstName || !lastName || !contact) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Check product exists and is available
    const product = await getProductById(parseInt(productId))
    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }
    if (product.status === 'reserved') {
      return NextResponse.json({ error: 'Ce produit est déjà réservé' }, { status: 409 })
    }

    await createReservation({
      productId: parseInt(productId),
      firstName,
      lastName,
      contact,
      message: message || '',
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
