import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products - List all products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const active = searchParams.get('active')
    const ids = searchParams.get('ids')

    const where: any = {}
    if (featured === 'true') where.featured = true
    if (active !== 'false') where.active = true
    if (ids) {
      where.id = { in: ids.split(',') }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST /api/products - Create product (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, imageUrl, ebookUrl, featured, active } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        ebookUrl,
        featured: featured || false,
        active: active !== false
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
