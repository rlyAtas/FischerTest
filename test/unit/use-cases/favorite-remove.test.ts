import { describe, expect, it } from 'vitest';
import type { FavoriteItemInput } from '../../../src/domain/repositories';
import { AppError } from '../../../src/errors/app-error';
import { type RemoveFavoriteRepositories, removeFavorite } from '../../../src/use-cases/favorite-remove';

describe('removeFavorite', () => {
  it('removes item from favorites', async () => {
    const favorites = [
      { userId: 1, itemId: 1 },
      { userId: 2, itemId: 1 },
      { userId: 1, itemId: 2 },
    ];
    const repositories = createRepositories([1, 2], favorites);

    await removeFavorite({ userId: 1, itemId: 1 }, repositories);

    expect(favorites).toStrictEqual([
      { userId: 2, itemId: 1 },
      { userId: 1, itemId: 2 },
    ]);
  });

  it('does not change favorites when item is already absent', async () => {
    const favorites = [
      { userId: 1, itemId: 1 },
      { userId: 2, itemId: 1 },
      { userId: 1, itemId: 2 },
    ];
    const repositories = createRepositories([1, 2], favorites);
    const input = { userId: 1, itemId: 1 };
    await removeFavorite(input, repositories);
    const savedFavorites = structuredClone(favorites);

    await removeFavorite(input, repositories);

    expect(favorites).toStrictEqual(savedFavorites);
  });

  it('throws error when item is not found without changing favorites', async () => {
    const favorites = [{ userId: 1, itemId: 1 }];
    const repositories = createRepositories([1], favorites);
    const savedFavorites = structuredClone(favorites);

    const result = removeFavorite({ userId: 1, itemId: 2 }, repositories);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({ code: 'item_not_found' });
    expect(favorites).toStrictEqual(savedFavorites);
  });
});

function createRepositories(itemIds: readonly number[], favorites: FavoriteItemInput[]): RemoveFavoriteRepositories {
  return {
    items: {
      async existsItem(itemId) {
        return itemIds.includes(itemId);
      },
    },
    favorites: {
      async removeFavorite(input) {
        const index = favorites.findIndex(
          (favorite) => favorite.userId === input.userId && favorite.itemId === input.itemId,
        );
        if (index !== -1) {
          favorites.splice(index, 1);
        }
      },
    },
  };
}
