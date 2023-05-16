import fastity from "fastify";
import { PrismaClient } from "@prisma/client";

const app = fastity();
const prisma = new PrismaClient();

app.get("/users", async () => {
  const users = await prisma.user.findMany();
  return users;
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP SERVER RUNING ON http://localhost:3333/.");
  });
