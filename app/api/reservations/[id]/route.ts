import { NextRequest, NextResponse } from 'next/server'
import { markReservationProcessed, deleteReservation } from '@/lib/db'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  try {
    const body = await request.json()
    await markReservationProcessed(parseInt(id), Boolean(body.processed))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  try {
    await deleteReservation(parseInt(id))
    revalidatePath('/')
    revalidatePath('/admin/produits')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
