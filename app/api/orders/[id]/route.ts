import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus } from '@/lib/db'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { Order } from '@/types'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  try {
    const body = await request.json()
    const { status, paymentStatus } = body as { status: Order['status']; paymentStatus?: Order['paymentStatus'] }

    await updateOrderStatus(parseInt(id), status, paymentStatus)
    revalidatePath('/admin/commandes')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
