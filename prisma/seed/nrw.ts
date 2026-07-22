import { topics } from '../../data/nrw.json';
import { prisma } from '../../src/lib/prisma';

const baseContentLanguageCode = 'de';

type TranslationMap = Record<string, string>;
type SeedAnswer = {
  text: string;
  isCorrect: boolean;
  translations: TranslationMap;
};
type SeedQuestion = {
  text: string;
  translations: TranslationMap;
  answers: SeedAnswer[];
};
type SeedTopic = {
  name: string;
  translations: TranslationMap;
  questions: SeedQuestion[];
};
type ExistingState = { id: number; code: string; name: string };
type ExistingLanguage = { id: number; code: string; name: string };

const nrwTopics: SeedTopic[] = topics;

function validateDataNRW(languages: ExistingLanguage[]) {
  for (const topic of nrwTopics) {
    // Each topic must have translations
    if (!topic.translations) {
      throw new Error(`${topic.name}: topic must have translations`);
    }
    // Each topic must have translations for all languages
    for (const language of languages) {
      if (language.code === baseContentLanguageCode) continue;
      if (!topic.translations[language.code]) {
        throw new Error(`${topic.name}: topic must have translations for language ${language.code}`);
      }
    }

    for (const question of topic.questions) {
      // Each question must have exactly 3 answers
      if (question.answers.length !== 3) {
        throw new Error(`${topic.name} | ${question.text}: question has wrong number of answers`);
      }

      // Each question must have translations
      if (!question.translations) {
        throw new Error(`${topic.name} | ${question.text}: question must have translations`);
      }
      // Each question must have translations for all languages
      for (const language of languages) {
        if (language.code === baseContentLanguageCode) continue;
        if (!question.translations[language.code]) {
          throw new Error(`${topic.name} | ${question.text}: question must have translation for ${language.code}`);
        }
      }

      // Each question must have exactly one correct answer
      const correctAnswers = question.answers.filter((answer) => answer.isCorrect === true);
      if (correctAnswers.length !== 1) {
        throw new Error(`${topic.name} | ${question.text}: question must have exactly one correct answer`);
      }

      for (const answer of question.answers) {
        //
        if (typeof answer.isCorrect !== 'boolean') {
          throw new Error(`${topic.name} | ${question.text} | ${answer.text}: isCorrect must be boolean`);
        }
        // Each answer must have translations
        if (!answer.translations) {
          throw new Error(`${topic.name} | ${question.text} | ${answer.text}: answer must have translations`);
        }

        // Each answer must have translations for all languages
        for (const language of languages) {
          if (language.code === baseContentLanguageCode) continue;
          if (!answer.translations[language.code]) {
            throw new Error(
              `${topic.name} | ${question.text} | ${answer.text}: answer must have translation for ${language.code}`,
            );
          }
        }
      }
    }
  }
}

function getLanguage(existingLanguages: ExistingLanguage[], languageCode: string) {
  const language = existingLanguages.find((language) => language.code === languageCode);
  if (!language) throw new Error(`Could not find language ${languageCode}`);
  return language;
}

function getState(states: ExistingState[], stateCode: string) {
  const state = states.find((state) => state.code === stateCode);
  if (!state) throw new Error(`Could not find state ${stateCode}`);
  return state;
}

async function seedTranslations(
  translations: TranslationMap,
  existingLanguages: ExistingLanguage[],
  upsertTranslation: (languageId: number, text: string) => Promise<void>,
) {
  for (const [languageCode, text] of Object.entries(translations)) {
    if (languageCode === baseContentLanguageCode) continue;
    const language = getLanguage(existingLanguages, languageCode);
    await upsertTranslation(language.id, text);
  }
}

export async function seedNRW(languages: ExistingLanguage[], states: ExistingState[]) {
  validateDataNRW(languages);

  const nrwState = getState(states, 'nrw');

  for (const topic of nrwTopics) {
    const createdTopic = await prisma.topic.upsert({
      where: {
        stateId_name: {
          stateId: nrwState.id,
          name: topic.name,
        },
      },
      update: {},
      create: {
        name: topic.name,
        stateId: nrwState.id,
      },
    });

    await seedTranslations(topic.translations, languages, async (languageId, text) => {
      await prisma.topicTranslation.upsert({
        where: {
          topicId_languageId: {
            topicId: createdTopic.id,
            languageId,
          },
        },
        update: { text },
        create: {
          text,
          topicId: createdTopic.id,
          languageId,
        },
      });
    });

    for (const question of topic.questions) {
      const createdItem = await prisma.item.upsert({
        where: {
          topicId_text: {
            topicId: createdTopic.id,
            text: question.text,
          },
        },
        update: {},
        create: {
          topicId: createdTopic.id,
          text: question.text,
        },
      });

      await seedTranslations(question.translations, languages, async (languageId, text) => {
        await prisma.itemTranslation.upsert({
          where: {
            itemId_languageId: {
              itemId: createdItem.id,
              languageId,
            },
          },
          update: { text },
          create: {
            text,
            itemId: createdItem.id,
            languageId,
          },
        });
      });

      for (const answer of question.answers) {
        const createdAnswer = await prisma.answer.upsert({
          where: {
            itemId_text: {
              itemId: createdItem.id,
              text: answer.text,
            },
          },
          update: { isCorrect: answer.isCorrect },
          create: {
            itemId: createdItem.id,
            text: answer.text,
            isCorrect: answer.isCorrect,
          },
        });

        await seedTranslations(answer.translations, languages, async (languageId, text) => {
          await prisma.answerTranslation.upsert({
            where: {
              answerId_languageId: {
                answerId: createdAnswer.id,
                languageId,
              },
            },
            update: { text },
            create: {
              text,
              answerId: createdAnswer.id,
              languageId,
            },
          });
        });
      }
    }
  }
}
