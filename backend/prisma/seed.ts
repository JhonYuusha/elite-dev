import { hash } from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const passwordHash = await hash("EliteDev123!", 10);

  const organizer = await prisma.user.upsert({
    where: {
      email: "organizer@elitedev.test",
    },
    update: {},
    create: {
      name: "Organizador Elite Dev",
      email: "organizer@elitedev.test",
      passwordHash,
      role: "ORGANIZER",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "cliente1@elitedev.test",
    },
    update: {},
    create: {
      name: "Cliente Um",
      email: "cliente1@elitedev.test",
      passwordHash,
      role: "CLIENT",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "cliente2@elitedev.test",
    },
    update: {},
    create: {
      name: "Cliente Dois",
      email: "cliente2@elitedev.test",
      passwordHash,
      role: "CLIENT",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "portaria@elitedev.test",
    },
    update: {},
    create: {
      name: "Portaria Elite Dev",
      email: "portaria@elitedev.test",
      passwordHash,
      role: "GATEKEEPER",
    },
  });

  const existingEvent = await prisma.event.findFirst({
    where: {
      externalProvider: "TMDB",
      externalId: "550",
      organizerId: organizer.id,
    },
  });

  if (!existingEvent) {
    await prisma.event.create({
      data: {
        organizerId: organizer.id,

        externalProvider: "TMDB",
        externalId: "550",

        title: "Clube da Luta",
        description:
          "Evento de demonstração criado para permitir a avaliação do fluxo completo da plataforma.",

        startsAt: new Date("2026-09-05T22:00:00.000Z"),

        venueName: "Cine Elite",
        venueAddress: "Uberlândia - MG",

        capacity: 100,
        availableTickets: 100,

        priceCents: 3500,

        status: "PUBLISHED",
      },
    });
  }

  const products = [
    {
      slug: "pipoca-classica",
      name: "Pipoca Clássica",
      description: "Pipoca tradicional para acompanhar a sessão.",
      category: "POPCORN" as const,
      priceCents: 1800,
      active: true,
      sortOrder: 1,
    },
    {
      slug: "pipoca-grande",
      name: "Pipoca Grande",
      description: "Porção grande de pipoca para a sessão.",
      category: "POPCORN" as const,
      priceCents: 2400,
      active: true,
      sortOrder: 2,
    },
    {
      slug: "refrigerante",
      name: "Refrigerante",
      description: "Refrigerante gelado para acompanhar o filme.",
      category: "DRINK" as const,
      priceCents: 1200,
      active: true,
      sortOrder: 3,
    },
    {
      slug: "agua",
      name: "Água",
      description: "Água mineral.",
      category: "DRINK" as const,
      priceCents: 700,
      active: true,
      sortOrder: 4,
    },
    {
      slug: "combo-cinema",
      name: "Combo Cinema",
      description: "Pipoca e refrigerante para uma pessoa.",
      category: "COMBO" as const,
      priceCents: 3900,
      active: true,
      sortOrder: 5,
    },
    {
      slug: "combo-dupla",
      name: "Combo Dupla",
      description: "Combo para compartilhar durante a sessão.",
      category: "COMBO" as const,
      priceCents: 5200,
      active: true,
      sortOrder: 6,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        slug: product.slug,
      },
      update: {
        name: product.name,
        description: product.description,
        category: product.category,
        priceCents: product.priceCents,
        active: product.active,
        sortOrder: product.sortOrder,
      },
      create: product,
    });
  }

  console.log("🌱 Seed concluído.");
  console.log("");
  console.log("Usuários de teste:");
  console.log("organizer@elitedev.test");
  console.log("cliente1@elitedev.test");
  console.log("cliente2@elitedev.test");
  console.log("portaria@elitedev.test");
  console.log("");
  console.log("Senha: EliteDev123!");
  console.log("");
  console.log(`${products.length} produtos da bomboniere sincronizados.`);
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });