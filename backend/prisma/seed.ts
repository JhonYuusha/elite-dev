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

  console.log("🌱 Seed concluído.");
  console.log("");
  console.log("Usuários de teste:");
  console.log("organizer@elitedev.test");
  console.log("cliente1@elitedev.test");
  console.log("cliente2@elitedev.test");
  console.log("portaria@elitedev.test");
  console.log("");
  console.log("Senha: EliteDev123!");
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
