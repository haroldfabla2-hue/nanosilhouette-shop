import { prisma } from './prisma'

// Configuración de MercadoPago
const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN!
const MERCADO_PAGO_URL = 'https://api.mercadopago.com/v1'

export interface CartItem {
  productId: string
  quantity: number
}

export interface CreatePaymentResult {
  paymentUrl: string
  paymentId: string
}

// Crear preferencia de pago en MercadoPago
export async function createMercadoPagoPayment(
  items: CartItem[],
  customerEmail: string,
  orderId: string
): Promise<CreatePaymentResult> {
  // Obtener productos y calcular total
  const productIds = items.map(item => item.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  })

  const totalAmount = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)
    return sum + (product ? Number(product.price) * item.quantity : 0)
  }, 0)

  // Crear preferencia en MercadoPago
  const response = await fetch(`${MERCADO_PAGO_URL}/payments/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      items: items.map(item => {
        const product = products.find(p => p.id === item.productId)
        return {
          title: product?.name || 'Product',
          quantity: item.quantity,
          unit_price: Number(product?.price || 0),
          currency_id: 'USD'
        }
      }),
      payer: {
        email: customerEmail
      },
      external_reference: orderId,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/webhook`,
      auto_return: 'approved'
    })
  })

  const data = await response.json()

  return {
    paymentUrl: data.init_point,
    paymentId: data.id
  }
}

// Verificar estado de pago en MercadoPago
export async function checkMercadoPagoPayment(paymentId: string): Promise<{
  status: string
  statusDetail: string
}> {
  const response = await fetch(`${MERCADO_PAGO_URL}/payments/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
    }
  })

  const data = await response.json()

  return {
    status: data.status,
    statusDetail: data.status_detail
  }
}

// PayPal SDK initialization helpers
export function getPayPalClientId(): string {
  return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''
}
