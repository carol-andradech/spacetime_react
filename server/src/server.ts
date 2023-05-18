import fastity from "fastify";
import { memoriesRoutes } from "./routes/memories";
import cors from "@fastify/cors";
const app = fastity();

app.register(cors, {
  origin: true, //todas URLs de front-end poderão acessar nosso back-end
});
app.register(memoriesRoutes);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP SERVER RUNING ON http://localhost:3333/.");
  });
