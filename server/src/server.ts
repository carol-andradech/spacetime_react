import "dotenv/config";
import fastity from "fastify";
import { memoriesRoutes } from "./routes/memories";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { authRoutes } from "./routes/auth";

const app = fastity();

app.register(cors, {
  origin: true, //todas URLs de front-end poderão acessar nosso back-end
});

app.register(jwt, {
  //uma maneira de diferenciar os tokens gerados por este back-end de outros jwt de outros back-ends, é um tipo de criptografia
  secret: "spacetime",
});

app.register(authRoutes);
app.register(memoriesRoutes);

app
  .listen({
    port: 3333,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log("HTTP SERVER RUNING ON http://localhost:3333/.");
  });
