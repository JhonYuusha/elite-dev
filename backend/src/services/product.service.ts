import { prisma } from "../lib/prisma.js";

async function listActiveProducts() {
  return prisma.product.findMany({
    where: {
      active: true,
    },

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],

    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      imageUrl: true,
      category: true,
      priceCents: true,
    },
  });
}

export const productService = {
  listActiveProducts,
};
