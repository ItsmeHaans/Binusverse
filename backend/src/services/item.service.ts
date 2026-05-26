import { itemRepository } from '../repositories/item.repository';
import { AppError } from '../utils/AppError';

export const itemService = {
  getCatalog() {
    return itemRepository.getAllItems();
  },

  getInventory(userId: string) {
    return itemRepository.getUserInventory(userId);
  },

  async useItem(userId: string, itemName: string) {
    const item = await itemRepository.findItemByName(itemName);
    if (!item) throw new AppError('Item not found', 404);

    const userItem = await itemRepository.findUserItem(userId, item.id);
    if (!userItem || userItem.quantity <= 0) throw new AppError('You do not own this item', 400);

    if (userItem.quantity === 1) {
      await itemRepository.deleteUserItem(userItem.id);
    } else {
      await itemRepository.decrementUserItem(userItem.id);
    }

    return { ability: item.ability, remainingQuantity: userItem.quantity - 1 };
  },
};
