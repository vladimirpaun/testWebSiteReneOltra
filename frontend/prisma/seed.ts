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
  // Clear existing stays to avoid conflicts
  await prisma.bookingSupplement.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.stay.deleteMany()

  const ZONES_CONFIG = [
    { id: 'O', label: 'Allée O', type: 'row', spots: 16, category: 'Standard' },
    { id: 'N', label: 'Allée N', type: 'row', spots: 16, category: 'Standard' },
    { id: 'M', label: 'Allée M', type: 'row', spots: 18, category: 'Confort' },
    { id: 'L', label: 'Allée L', type: 'row', spots: 18, category: 'Confort' },
    { id: 'K', label: 'Allée K', type: 'row', spots: 20, category: 'Grand Confort' },
    { id: 'J', label: 'Allée J', type: 'row', spots: 20, category: 'Grand Confort' },
    { id: 'I', label: 'Allée I', type: 'row', spots: 20, category: 'Premium' },
    { id: 'H', label: 'Allée H', type: 'row', spots: 22, category: 'Premium' },
    { id: 'G', label: 'Allée G', type: 'row', spots: 22, category: 'Premium' },
    { id: 'F', label: 'Allée F', type: 'row', spots: 22, category: 'Standard' },
    { id: 'E', label: 'Allée E', type: 'row', spots: 24, category: 'Standard' },
    { id: 'D', label: 'Allée D', type: 'row', spots: 24, category: 'Standard' },
    { id: 'C', label: 'Allée C', type: 'row', spots: 24, category: 'Plage' },
    { id: 'B', label: 'Allée B', type: 'row', spots: 24, category: 'Plage' },
    { id: 'A', label: 'Allée A', type: 'row', spots: 24, category: 'Plage' },
  ]

  const VILLAGES = [
    { id: 'V1', label: 'Village Hestia', spots: 8 },
    { id: 'V2', label: 'Village Horus', spots: 8 },
    { id: 'V3', label: 'Village Osiris', spots: 8 },
    { id: 'V4', label: 'Village Zeus', spots: 6 },
    { id: 'V5', label: 'Village Neptune', spots: 6 },
  ]

  const getPrice = (category: string) => {
    const base: Record<string, number> = {
      'Standard': 45,
      'Confort': 55,
      'Grand Confort': 65,
      'Premium': 75,
      'Plage': 85,
      'Cottage': 120
    }
    return base[category] || 50
  }

  // Generate Zone Stays
  for (const zone of ZONES_CONFIG) {
    for (let i = 1; i <= zone.spots; i++) {
      await prisma.stay.create({
        data: {
          name: `${zone.label} - Emplacement ${i}`,
          type: zone.category,
          capacity: 6,
          surface: 90,
          rooms: 0,
          bathrooms: 0,
          description: `Emplacement ${zone.category} avec électricité 10A, Eau, Wifi.`,
          basePrice: getPrice(zone.category),
          images: JSON.stringify(['/images/emplacement.jpg']),
          zoneId: zone.id,
          number: i,
        },
      })
    }
  }

  // Generate Village Stays
  for (const village of VILLAGES) {
    for (let i = 1; i <= village.spots; i++) {
      await prisma.stay.create({
        data: {
          name: `${village.label} - Cottage ${i}`,
          type: 'Cottage',
          capacity: 4,
          surface: 35,
          rooms: 2,
          bathrooms: 1,
          description: 'Cottage tout équipé avec climatisation, TV, terrasse et Wifi Premium.',
          basePrice: 120,
          images: JSON.stringify(['/images/mobilhome-confort.jpg']),
          zoneId: village.id,
          number: i,
        },
      })
    }
  }

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
