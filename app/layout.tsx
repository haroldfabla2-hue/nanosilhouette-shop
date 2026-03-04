import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Nanosilhouette - Tienda de E-books',
  description: 'Tienda online de e-books para transformar tu negocio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {/* Navbar */}
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-xl font-bold text-purple-600">
                Nanosilhouette
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/" className="text-gray-700 hover:text-purple-600">
                  Catálogo
                </Link>
                <Link href="/cart" className="text-gray-700 hover:text-purple-600">
                  Carrito 🛒
                </Link>
                <Link href="/admin" className="text-gray-700 hover:text-purple-600">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        {children}
      </body>
    </html>
  )
}
