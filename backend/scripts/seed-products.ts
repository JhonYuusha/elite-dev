import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";

const products = [
  {
    slug: "pipoca-classica",
    name: "Pipoca Clássica",
    description:
      "Pipoca salgada tradicional.",
    category:
      "POPCORN" as const,
    priceCents: 1800,
    sortOrder: 1,
  },
  {
    slug: "pipoca-grande",
    name: "Pipoca Grande",
    description:
      "Pipoca salgada em tamanho grande.",
    category:
      "POPCORN" as const,
    priceCents: 2400,
    sortOrder: 2,
  },
  {
    slug: "refrigerante",
    name: "Refrigerante",
    description:
      "Refrigerante de 500 ml.",
    category:
      "DRINK" as const,
    priceCents: 1200,
    sortOrder: 3,
  },
  {
    slug: "agua",
    name: "Água",
    description:
      "Água mineral de 500 ml.",
    category:
      "DRINK" as const,
    priceCents: 700,
    sortOrder: 4,
  },
  {
    slug: "combo-cinema",
    name: "Combo Cinema",
    description:
      "Pipoca grande + 2 refrigerantes.",
    category:
      "COMBO" as const,
    priceCents: 3900,
    sortOrder: 5,
  },
  {
    slug: "combo-dupla",
    name: "Combo Dupla",
    description:
      "2 pipocas + 2 refrigerantes.",
    category:
      "COMBO" as const,
    priceCents: 5200,
    sortOrder: 6,
  },
];

async function main() {
  for (
    const product
    of products
  ) {
    await prisma.product.upsert({
      where: {
        slug: product.slug,
      },

      update: {
        name: product.name,
        description:
          product.description,
        category:
          product.category,
        priceCents:
          product.priceCents,
        sortOrder:
          product.sortOrder,
        active: true,
      },

      create: product,
    });
  }

  const count =
    await prisma.product.count({
      where: {
        active: true,
      },
    });

  console.log(
    `Bomboniere pronta: ${count} produto(s) ativo(s).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
