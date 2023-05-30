import { FastifyInstance } from "fastify";
import axios from "axios";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (request) => {
    const bodySchema = z.object({
      code: z.string(),
    });

    const { code } = bodySchema.parse(request.body);

    //Quero enviar o código e receber p access_token
    //Corpo da requisição não tem, então NULL
    const accessTokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      null,
      {
        //O terceiro parâmetro são as configurações das requisições
        //São os parâmetros da URL
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        //formato da resposta
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token } = accessTokenResponse.data;
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string(),
      avatar_url: z.string().url(),
    });

    const userInfo = userSchema.parse(userResponse.data);

    //Antes de salvar no banco de dados, verificar se o user já existe

    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id,
      },
    });

    //Se não encontrar um usuário com esse id, então cria o usuário
    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url,
        },
      });
    }

    //O access token expira depois de um dia. Não posso depender dele.
    //Vou criar algo chamado. JWT - JSON WEB TOKEN.
    //Que é basicamente um token criado pelo meu back end enviado p o front end para identificar o usuário.
    const token = app.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id, //subject, qual usuário, utiliza um dado único
        expiresIn: "30 days",
      }
    );

    return {
      token,
    };
  });
}
