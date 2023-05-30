import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function memoriesRoutes(app: FastifyInstance) {
  //Antes de executar o handler de cada uma das rotas,verificar se o usuário está autenticado
  app.addHook("preHandler", async (request) => {
    await request.jwtVerify();
  });

  app.get("/memories", async (request) => {
    //Verifica se na requisição que o front end está fazendo para essa rota, está vindo também o token
    await request.jwtVerify();

    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
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

  app.get("/memories/:id", async (request, reply) => {
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

    //Se a memória não for pública e o user for diferente do user.sub retorna erro. Pois se for pública, qualquer um pode acessar
    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send();
    }

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
        userId: request.user.sub,
      },
    });

    return memory;
  });

  app.put("/memories/:id", async (request, reply) => {
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

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });

    //Se o id de quem criou a memória for diferente do id do usuário logado
    if (memory.userId !== request.user.sub) {
      return reply.status(401).send();
    }

    memory = await prisma.memory.update({
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

  app.delete("/memories/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });

    //Se o id de quem criou a memória for diferente do id do usuário logado
    if (memory.userId !== request.user.sub) {
      return reply.status(401).send();
    }

    await prisma.memory.delete({
      where: {
        id,
      },
    });
  });
}
