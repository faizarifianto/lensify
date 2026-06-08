const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Resetting DB...');
  await prisma.review.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.camera.deleteMany({});
  console.log('Finished removing catalogue data.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
