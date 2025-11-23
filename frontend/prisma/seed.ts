import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Supplements
  const sheet = await prisma.supplement.create({
    data: {
      name: 'Draps (paire)',
      price: 12.0,
      type: 'Sheet',
    },
  })

  const cleaning = await prisma.supplement.create({
    data: {
      name: 'Ménage fin de séjour',
      price: 60.0,
      type: 'Cleaning',
    },
  })

  // Create Stays
  await prisma.stay.create({
    data: {
      name: 'Mobil-home Confort',
      type: 'Mobil-home',
      capacity: 4,
      surface: 28,
      rooms: 2,
      bathrooms: 1,
      description: 'Un mobil-home confortable pour toute la famille.',
      basePrice: 80.0,
      images: JSON.stringify(['/images/mobilhome-confort.jpg']),
    },
  })

  await prisma.stay.create({
    data: {
      name: 'Emplacement Tente',
      type: 'Emplacement',
      capacity: 6,
      surface: 100,
      rooms: 0,
      bathrooms: 0,
      description: 'Grand emplacement pour tente ou caravane avec électricité.',
      basePrice: 25.0,
      images: JSON.stringify(['/images/emplacement.jpg']),
    },
  })

  await prisma.stay.create({
    data: {
      name: 'Chalet Luxe',
      type: 'Chalet',
      capacity: 6,
      surface: 45,
      rooms: 3,
      bathrooms: 2,
      description: 'Chalet haut de gamme avec terrasse et vue mer.',
      basePrice: 150.0,
      images: JSON.stringify(['/images/chalet-luxe.jpg']),
    },
  })

  console.log('Database seeded!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
