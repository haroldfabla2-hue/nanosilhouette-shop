import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createMercadoPagoPayment } from '@/lib/payments'

// POST /api/checkout - Create order and initiate payment
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, customerEmail, customerName, paymentMethod } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email required' }, { status: 400 })
    }

    // Get products and calculate total
    const productIds = items.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    const totalAmount = items.reduce((sum: number, item: any) => {
      const product = products.find((p: any) => p.id === item.productId)
      return sum + (product ? Number(product.price) * item.quantity : 0)
    }, 0)

    // Create order
    const order = await prisma.order.create({
      data: {
        customerEmail,
        customerName,
        totalAmount,
        paymentMethod,
        status: 'PENDING'
      }
    })

    // Create order items
    await prisma.orderItem.createMany({
      data: items.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: products.find((p: any) => p.id === item.productId)?.price || 0
      }))
    })

    // Create payment based on method
    let paymentUrl = ''
    let paymentId = ''

    if (paymentMethod === 'mercadopago') {
      const payment = await createMercadoPagoPayment(items, customerEmail, order.id)
      paymentUrl = payment.paymentUrl
      paymentId = payment.paymentId

      // Update order with payment info
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId }
      })
    } else if (paymentMethod === 'paypal') {
      // For PayPal, we'll handle it on the client side
      paymentUrl = `/checkout/paypal?orderId=${order.id}`
    }

    return NextResponse.json({
      orderId: order.id,
      paymentUrl,
      totalAmount
    })
  } catch (error) {
    console.error('Error creating checkout:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
