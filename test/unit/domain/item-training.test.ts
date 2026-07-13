import { describe, expect, it } from 'vitest';
import { DomainError } from '../../../src/domain/domain-error';
import type { SortableItem } from '../../../src/domain/item-sort';
import {
  buildAllTrainingItems,
  buildFavoritesTrainingItems,
  buildTopicTrainingItems,
  type ItemWithFavorites,
  type ItemWithTopic,
} from '../../../src/domain/item-training';

describe('buildAllTrainingItems', () => {
  const items: SortableItem[] = [
    { id: 1, status: 'mastered' },
    { id: 2, status: 'learning' },
    { id: 3, status: 'problematic' },
    { id: 4, status: 'new' },
    { id: 5, status: 'new' },
    { id: 6, status: 'problematic' },
    { id: 7, status: 'learning' },
    { id: 8, status: 'mastered' },
  ];

  it('builds all training items sorted by status', () => {
    expect(buildAllTrainingItems(items)).toStrictEqual([
      { id: 4, status: 'new' },
      { id: 5, status: 'new' },
      { id: 3, status: 'problematic' },
      { id: 6, status: 'problematic' },
      { id: 2, status: 'learning' },
      { id: 7, status: 'learning' },
      { id: 1, status: 'mastered' },
      { id: 8, status: 'mastered' },
    ]);
  });
});

describe('buildTopicTrainingItems', () => {
  const itemWithTopic: ItemWithTopic[] = [
    { id: 1, status: 'mastered', topicId: 1 },
    { id: 2, status: 'learning', topicId: 1 },
    { id: 3, status: 'problematic', topicId: 1 },
    { id: 4, status: 'new', topicId: 1 },
    { id: 5, status: 'new', topicId: 2 },
    { id: 6, status: 'problematic', topicId: 2 },
    { id: 7, status: 'learning', topicId: 2 },
    { id: 8, status: 'mastered', topicId: 2 },
  ];

  it('builds topic training items filtered by topic and sorted by status', () => {
    expect(buildTopicTrainingItems(itemWithTopic, 1)).toStrictEqual([
      { id: 4, status: 'new', topicId: 1 },
      { id: 3, status: 'problematic', topicId: 1 },
      { id: 2, status: 'learning', topicId: 1 },
      { id: 1, status: 'mastered', topicId: 1 },
    ]);
  });
});

describe('buildFavoritesTrainingItems', () => {
  const itemWithFavorites: ItemWithFavorites[] = [
    { id: 1, status: 'mastered', isFavorite: true },
    { id: 2, status: 'learning', isFavorite: true },
    { id: 3, status: 'problematic', isFavorite: true },
    { id: 4, status: 'new', isFavorite: true },
    { id: 5, status: 'new', isFavorite: false },
    { id: 6, status: 'problematic', isFavorite: false },
    { id: 7, status: 'learning', isFavorite: false },
    { id: 8, status: 'mastered', isFavorite: false },
  ];

  it('builds favorite training items filtered by favorite flag and sorted by status', () => {
    expect(buildFavoritesTrainingItems(itemWithFavorites)).toStrictEqual([
      { id: 4, status: 'new', isFavorite: true },
      { id: 3, status: 'problematic', isFavorite: true },
      { id: 2, status: 'learning', isFavorite: true },
      { id: 1, status: 'mastered', isFavorite: true },
    ]);
  });

  it('throws domain error when no favorite items', () => {
    expect(() => buildFavoritesTrainingItems([])).toThrow(
      new DomainError('empty_favorites_training'),
    );
  });

  it('throws domain error when items exist but none are favorite', () => {
    expect(() =>
      buildFavoritesTrainingItems([{ id: 1, status: 'new', isFavorite: false }]),
    ).toThrow(new DomainError('empty_favorites_training'));
  });
});
