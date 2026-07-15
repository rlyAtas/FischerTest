export type ItemStatus = 'new' | 'problematic' | 'learning' | 'mastered';

type StoredItemStatus = Exclude<ItemStatus, 'new'>;

export function getCurrentItemStatus(
  itemProgress: { status: StoredItemStatus } | null,
): ItemStatus {
  return itemProgress?.status ?? 'new';
}

export function changeItemStatus(currentStatus: ItemStatus, isAnswerCorrect: boolean): ItemStatus {
  if (currentStatus === 'new') {
    return isAnswerCorrect ? 'learning' : 'problematic';
  }
  if (currentStatus === 'problematic') {
    return isAnswerCorrect ? 'learning' : 'problematic';
  }
  if (currentStatus === 'learning') {
    return isAnswerCorrect ? 'mastered' : 'problematic';
  }
  return isAnswerCorrect ? 'mastered' : 'problematic';
}

export type ItemStatusStats = {
  new: number;
  problematic: number;
  learning: number;
  mastered: number;
};

export type ItemWithProgress = {
  itemProgress: { status: StoredItemStatus } | null;
};

export function calculateItemStatusStats(items: readonly ItemWithProgress[]): ItemStatusStats {
  const stats: ItemStatusStats = {
    new: 0,
    problematic: 0,
    learning: 0,
    mastered: 0,
  };

  for (const item of items) {
    const status = getCurrentItemStatus(item.itemProgress);
    stats[status] += 1;
  }

  return stats;
}
