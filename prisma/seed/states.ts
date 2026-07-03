import { states } from '../../data/states.json';
import { prisma } from '../../src/lib/prisma';

type SeedState = { code: string; name: string };
type ExistingState = { id: number } & SeedState;

function validateDataStates(states: SeedState[]) {
  const codes = new Set<string>();
  const names = new Set<string>();

  for (const state of states) {
    if (!state.code.trim() || !state.name.trim()) {
      throw new Error('State must have a code and a name');
    }

    if (codes.has(state.code)) {
      throw new Error(`Duplicate state code: ${state.code}`);
    }

    if (names.has(state.name)) {
      throw new Error(`Duplicate state name: ${state.name}`);
    }

    codes.add(state.code);
    names.add(state.name);
  }
}

export async function seedStates(): Promise<ExistingState[]> {
  validateDataStates(states);

  const existingStates: ExistingState[] = [];

  for (const state of states) {
    const currentState = await prisma.state.upsert({
      where: { code: state.code },
      update: { name: state.name },
      create: state,
    });
    existingStates.push(currentState);
  }

  return existingStates;
}
