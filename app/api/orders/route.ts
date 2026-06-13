import { NextRequest, NextResponse } from 'next/server'
import { createOrder, getAllOrders } from '@/lib/db'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const orders = await getAllOrders()
    return NextResponse.json(orders)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, contact, message, items } = body

    if (!firstName || !lastName || !contact || !items?.length) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json({ error: 'Données du panier invalides' }, { status: 400 })
      }
    }

    const result = await createOrder({ firstName, lastName, contact, message: message || '', items })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 })
    }

    revalidatePath('/')
    revalidatePath('/admin/commandes')

    return NextResponse.json({ success: true, orderId: result.orderId }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
