import type { FavoriteItemInput, FavoriteRepository, ItemRepository } from '../domain/repositories';
import { AppError } from '../errors/app-error';

export type RemoveFavoriteRepositories = {
  items: Pick<ItemRepository, 'existsItem'>;
  favorites: Pick<FavoriteRepository, 'removeFavorite'>;
};

/**
 * Проверяет существование вопроса и удаляет его из избранного.
 * Повторное удаление отсутствующей записи успешно обрабатывается репозиторием.
 */
export async function removeFavorite(
  input: FavoriteItemInput,
  repositories: RemoveFavoriteRepositories,
): Promise<void> {
  const itemExists = await repositories.items.existsItem(input.itemId);

  if (!itemExists) {
    throw new AppError('item_not_found');
  }

  await repositories.favorites.removeFavorite(input);
}
