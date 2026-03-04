'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string
  price: string
  imageUrl: string | null
  ebookUrl: string | null
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  useEffect(() => {
    if (!resolvedParams) return

    fetch(`/api/products/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [resolvedParams])

  const addToCart = () => {
    if (!product) return

    setAdding(true)
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.productId === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ productId: product.id, quantity })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    setAdding(false)
    router.push('/cart')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Producto no encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-1/2">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-4xl font-bold text-purple-600 mb-6">${product.price}</p>
              <p className="text-gray-600 mb-8">{product.description}</p>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={addToCart}
                disabled={adding}
                className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
              >
                {adding ? 'Agregando...' : 'Agregar al Carrito'}
              </button>

              {/* Back to Home */}
              <button
                onClick={() => router.push('/')}
                className="w-full mt-4 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Volver al Catálogo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
