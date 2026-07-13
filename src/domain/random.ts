export type RandomIndexGenerator = (maxIndex: number) => number;

export function shuffleItems<ItemType>(
  items: readonly ItemType[],
  random: RandomIndexGenerator = randomIndexGenerator,
): ItemType[] {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = random(index);
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

export function randomIndexGenerator(maxIndex: number): number {
  return Math.floor(Math.random() * (maxIndex + 1));
}
