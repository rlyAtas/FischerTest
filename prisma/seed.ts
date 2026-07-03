import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { seedLanguages } from './seed/languages';
import { seedNRW } from './seed/nrw';
import { seedStates } from './seed/states';

async function main() {
  const languages = await seedLanguages();
  const states = await seedStates();
  await seedNRW(languages, states);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
