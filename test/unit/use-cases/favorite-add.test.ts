import { describe, expect, it } from 'vitest';
import type { FavoriteItemInput } from '../../../src/domain/repositories';
import { AppError } from '../../../src/errors/app-error';
import { type AddFavoriteRepositories, addFavorite } from '../../../src/use-cases/favorite-add';

describe('addFavorite', () => {
  it('adds item to favorites', async () => {
    const favorites = [
      { userId: 2, itemId: 1 },
      { userId: 1, itemId: 2 },
    ];
    const repositories = createRepositories([1, 2], favorites);

    await addFavorite({ userId: 1, itemId: 1 }, repositories);

    expect(favorites).toStrictEqual([
      { userId: 2, itemId: 1 },
      { userId: 1, itemId: 2 },
      { userId: 1, itemId: 1 },
    ]);
  });

  it('does not change favorites when item is already present', async () => {
    const favorites: FavoriteItemInput[] = [];
    const repositories = createRepositories([1], favorites);
    const input = { userId: 1, itemId: 1 };
    await addFavorite(input, repositories);
    const savedFavorites = structuredClone(favorites);

    await addFavorite(input, repositories);

    expect(favorites).toStrictEqual(savedFavorites);
  });

  it('throws error when item is not found without changing favorites', async () => {
    const favorites = [{ userId: 1, itemId: 1 }];
    const repositories = createRepositories([1], favorites);
    const savedFavorites = structuredClone(favorites);

    const result = addFavorite({ userId: 1, itemId: 2 }, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'item_not_found' });
    expect(favorites).toStrictEqual(savedFavorites);
  });
});

function createRepositories(itemIds: readonly number[], favorites: FavoriteItemInput[]): AddFavoriteRepositories {
  return {
    items: {
      async existsItem(itemId) {
        return itemIds.includes(itemId);
      },
    },
    favorites: {
      async addFavorite(input) {
        const exists = favorites.some(
          (favorite) => favorite.userId === input.userId && favorite.itemId === input.itemId,
        );
        if (!exists) {
          favorites.push({ ...input });
        }
      },
    },
  };
}
