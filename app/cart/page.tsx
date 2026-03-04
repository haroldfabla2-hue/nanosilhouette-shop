'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CartItem {
  productId: string
  quantity: number
}

interface Product {
  id: string
  name: string
  price: string
  imageUrl: string | null
}

interface CartItemWithProduct extends CartItem {
  product: Product
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    if (cart.length === 0) {
      setItems([])
      setLoading(false)
      return
    }

    // Fetch product details for each item
    const productIds = cart.map((item: CartItem) => item.productId)
    const response = await fetch(`/api/products?ids=${productIds.join(',')}`)
    const products: Product[] = await response.json()

    const itemsWithProducts = cart.map((item: CartItem) => ({
      ...item,
      product: products.find(p => p.id === item.productId)
    })).filter((item: CartItemWithProduct) => item.product)

    setItems(itemsWithProducts)
    setLoading(false)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId)
      return
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const item = cart.find((i: CartItem) => i.productId === productId)
    if (item) {
      item.quantity = quantity
      localStorage.setItem('cart', JSON.stringify(cart))
      loadCart()
    }
  }

  const removeItem = (productId: string) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const filtered = cart.filter((i: CartItem) => i.productId !== productId)
    localStorage.setItem('cart', JSON.stringify(filtered))
    loadCart()
  }

  const getTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity)
    }, 0).toFixed(2)
  }

  const handleCheckout = async (paymentMethod: string) => {
    if (items.length === 0) return

    setCheckingOut(true)
    const customerEmail = prompt('Ingresa tu email:')
    if (!customerEmail) {
      setCheckingOut(false)
      return
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          customerEmail,
          paymentMethod
        })
      })

      const data = await response.json()

      if (data.paymentUrl) {
        localStorage.removeItem('cart')
        window.location.href = data.paymentUrl
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error al procesar el pago')
    } finally {
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-8">Tu Carrito está Vacío</h1>
          <Link 
            href="/" 
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Ver Catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.productId} className="bg-white rounded-lg shadow p-6 flex gap-4">
                {item.product.imageUrl && (
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.product.name}</h3>
                  <p className="text-purple-600 font-bold">${item.product.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${getTotal()}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Total</span>
              <span className="text-xl font-bold">${getTotal()}</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleCheckout('mercadopago')}
                disabled={checkingOut}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
              >
                {checkingOut ? 'Procesando...' : 'Pagar con MercadoPago'}
              </button>
              <button
                onClick={() => handleCheckout('paypal')}
                disabled={checkingOut}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {checkingOut ? 'Procesando...' : 'Pagar con PayPal'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
