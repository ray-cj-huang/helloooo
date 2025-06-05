import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.post.deleteMany()

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        name: 'First Post',
      },
    }),
    prisma.post.create({
      data: {
        name: 'Second Post',
      },
    }),
    prisma.post.create({
      data: {
        name: 'Third Post',
      },
    }),
  ])

  console.log('Created posts:', posts)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  }) 