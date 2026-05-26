import prisma from '../prisma';

export const itemRepository = {
  getAllItems() {
    return prisma.item.findMany({ orderBy: { rarity: 'desc' } });
  },

  getUserInventory(userId: string) {
    return prisma.userItem.findMany({
      where: { userId },
      include: { item: true },
    });
  },

  findUserItem(userId: string, itemId: string) {
    return prisma.userItem.findUnique({
      where: { userId_itemId: { userId, itemId } },
      include: { item: true },
    });
  },

  findItemByName(name: string) {
    return prisma.item.findUnique({ where: { name } });
  },

  decrementUserItem(id: string) {
    return prisma.userItem.update({
      where: { id },
      data: { quantity: { decrement: 1 } },
    });
  },

  deleteUserItem(id: string) {
    return prisma.userItem.delete({ where: { id } });
  },

  giveItemToUser(userId: string, itemId: string, quantity: number = 1) {
    return prisma.userItem.upsert({
      where: { userId_itemId: { userId, itemId } },
      update: { quantity: { increment: quantity } },
      create: { userId, itemId, quantity },
    });
  },
};
