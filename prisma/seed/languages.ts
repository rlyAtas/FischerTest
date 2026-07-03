import { languages } from '../../data/languages.json';
import { prisma } from '../../src/lib/prisma';

type SeedLanguage = { code: string; name: string };
type ExistingLanguage = { id: number } & SeedLanguage;

function validateDataLanguages(languages: SeedLanguage[]) {
  const codes = new Set<string>();
  const names = new Set<string>();

  for (const language of languages) {
    if (!language.code.trim() || !language.name.trim()) {
      throw new Error('Language must have a code and a name');
    }

    if (codes.has(language.code)) {
      throw new Error(`Duplicate language code: ${language.code}`);
    }

    if (names.has(language.name)) {
      throw new Error(`Duplicate language name: ${language.name}`);
    }

    codes.add(language.code);
    names.add(language.name);
  }
}
export async function seedLanguages(): Promise<ExistingLanguage[]> {
  validateDataLanguages(languages);

  const existingLanguages: ExistingLanguage[] = [];

  for (const language of languages) {
    const currentLanguage = await prisma.language.upsert({
      where: { code: language.code },
      update: { name: language.name },
      create: language,
    });
    existingLanguages.push(currentLanguage);
  }

  return existingLanguages;
}
