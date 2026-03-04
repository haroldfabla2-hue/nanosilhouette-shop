import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create sample products
  const products = [
    {
      name: 'Guía Completa de Automatización con n8n',
      description: 'Aprende a automatizar tu negocio desde cero con n8n. Incluye más de 20 flujos de trabajo listos para usar.',
      price: 29.99,
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
      featured: true,
      active: true
    },
    {
      name: 'Mastering AI Agents',
      description: 'Cómo construir agentes de IA que trabajan para ti 24/7. Casos de uso reales y código fuente.',
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      featured: true,
      active: true
    },
    {
      name: 'Workflows para Freelancers',
      description: 'Automatiza tu negocio como freelancer. Propuestas, facturas, seguimiento de clientes y más.',
      price: 19.99,
      imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400',
      featured: false,
      active: true
    },
    {
      name: 'Silhouette OS - Manual de Usuario',
      description: 'Guía completa para usar Silhouette OS. Configuración, comandos y mejores prácticas.',
      price: 14.99,
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      featured: false,
      active: true
    }
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name.toLowerCase().replace(/\s+/g, '-') },
      update: product,
      create: product
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
