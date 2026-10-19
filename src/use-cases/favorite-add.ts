import type { FavoriteItemInput, FavoriteRepository, ItemRepository } from '../domain/repositories';
import { AppError } from '../errors/app-error';

export type AddFavoriteRepositories = {
  items: Pick<ItemRepository, 'existsItem'>;
  favorites: Pick<FavoriteRepository, 'addFavorite'>;
};

/**
 * Проверяет существование вопроса и добавляет его в избранное.
 * Репозиторий обеспечивает отсутствие дубликатов при повторном добавлении.
 */
export async function addFavorite(input: FavoriteItemInput, repositories: AddFavoriteRepositories): Promise<void> {
  const itemExists = await repositories.items.existsItem(input.itemId);

  if (!itemExists) {
    throw new AppError('item_not_found');
  }

  await repositories.favorites.addFavorite(input);
}
