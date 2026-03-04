'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: string
  imageUrl: string | null
  ebookUrl: string | null
  featured: boolean
  active: boolean
}

interface Order {
  id: string
  customerEmail: string
  customerName: string | null
  status: string
  totalAmount: string
  paymentMethod: string | null
  createdAt: string
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    ebookUrl: '',
    featured: false,
    active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ])
      const productsData = await productsRes.json()
      const ordersData = await ordersRes.json()
      setProducts(productsData)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      setShowProductForm(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        ebookUrl: '',
        featured: false,
        active: true
      })
      loadData()
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl || '',
      ebookUrl: product.ebookUrl || '',
      featured: product.featured,
      active: product.active
    })
    setShowProductForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      loadData()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const toggleProductStatus = async (product: Product) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !product.active })
      })
      loadData()
    } catch (error) {
      console.error('Error toggling product:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Admin - Nanosilhouette</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-lg font-semibold ${
              activeTab === 'products' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-lg font-semibold ${
              activeTab === 'orders' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Pedidos
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Gestión de Productos</h2>
              <button
                onClick={() => {
                  setEditingProduct(null)
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    imageUrl: '',
                    ebookUrl: '',
                    featured: false,
                    active: true
                  })
                  setShowProductForm(true)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
              >
                + Nuevo Producto
              </button>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border rounded-lg px-4 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Descripción</label>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border rounded-lg px-4 py-2"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Precio</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        className="w-full border rounded-lg px-4 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">URL de Imagen</label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full border rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">URL del Ebook</label>
                      <input
                        type="url"
                        value={formData.ebookUrl}
                        onChange={e => setFormData({ ...formData, ebookUrl: e.target.value })}
                        className="w-full border rounded-lg px-4 py-2"
                      />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                        />
                        Destacado
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={e => setFormData({ ...formData, active: e.target.checked })}
                        />
                        Activo
                      </label>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700"
                      >
                        {editingProduct ? 'Actualizar' : 'Crear'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowProductForm(false)}
                        className="flex-1 border py-2 rounded-lg font-semibold hover:bg-gray-100"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Precio</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Destacado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-t">
                      <td className="px-4 py-3">{product.name}</td>
                      <td className="px-4 py-3">${product.price}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {product.featured ? '⭐' : ''}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleProductStatus(product)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          {product.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No hay productos. Crea el primero.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Gestión de Pedidos</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Método</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-t">
                      <td className="px-4 py-3 text-sm">{order.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3">
                        <div>{order.customerEmail}</div>
                        {order.customerName && (
                          <div className="text-sm text-gray-500">{order.customerName}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">${order.totalAmount}</td>
                      <td className="px-4 py-3">{order.paymentMethod || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No hay pedidos aún.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
