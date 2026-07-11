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
