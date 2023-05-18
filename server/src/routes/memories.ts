import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function memoriesRoutes(app: FastifyInstance) {
  app.get("/memories", async () => {
    const memories = await prisma.memory.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });
    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat("..."),
      };
    });
  });

  app.get("/memories/:id", async (request) => {
    //Meu params é um objeto, espero que tenha um id do tipo string, e do tipo uuid
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    //Pego o params e passo para o zod fazer uma verificação de que ele segue esse schema, a estrutura de dados
    //Se sim, ele retorna o id, se não, retorna um erro
    const { id } = paramsSchema.parse(request.params);

    //Encontra a memoria com esse dia, se não encontrar dispara um erro
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        //mesma coisa que id:id
        id,
      },
    });

    return memory;
  });

  app.post("/memories", async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      //O coerce faz o valor que chegar no isPublic para boolean. Por exemplo, se chegar 0, null, seria false.
      isPublic: z.coerce.boolean().default(false),
    });

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body);

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: "c8b404b1-61ab-44d6-b6cb-2bec765ed2dd",
      },
    });

    return memory;
  });

  app.put("/memories/:id", async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      //O coerce faz o valor que chegar no isPublic para boolean. Por exemplo, se chegar 0, null, seria false.
      isPublic: z.coerce.boolean().default(false),
    });

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body);

    const memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    });

    return memory;
  });

  app.delete("/memories/:id", async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    await prisma.memory.delete({
      where: {
        id,
      },
    });
  });
}
