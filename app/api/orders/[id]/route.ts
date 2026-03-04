import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkMercadoPagoPayment } from '@/lib/payments'

// GET /api/orders/[id] - Get order details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check payment status if pending
    if (order.status === 'PENDING' && order.paymentId && order.paymentMethod === 'mercadopago') {
      const paymentStatus = await checkMercadoPagoPayment(order.paymentId)
      
      if (paymentStatus.status === 'approved') {
        await prisma.order.update({
          where: { id },
          data: { status: 'PAID' }
        })
        order.status = 'PAID'
      } else if (paymentStatus.status === 'rejected' || paymentStatus.status === 'cancelled') {
        await prisma.order.update({
          where: { id },
          data: { status: 'FAILED' }
        })
        order.status = 'FAILED'
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
