import { Elysia, t } from "elysia";
import { configureNotesRoutes } from "./routes/NotesRoute";
import { configureCustomerRoutes } from "./routes/CustomerRoute";
import * as api from '@opentelemetry/api';
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";

const randomNumber = (min: number, max: number) => Math.floor(Math.random() * max + min);

import {init}  from "./tracer";
// import initializeTracing from "./tracer";
// const tracer = initializeTracing("elysia-server")

// const tracer = init('elysia-service', 4318) // calling tracer with service name and environment to view in jaegerui

import { swagger } from "@elysiajs/swagger";
import bearer from "@elysiajs/bearer";
import { auth } from "./handler/auth";

const app = new Elysia();

app.use(
  jwt({
    name: "jwt",
    secret: "7960154b73b276a8c5cf01378acc7fb2",
    exp: '1h'
  })
)
.use(cookie())
.use(bearer())

app.use(swagger());

app.trace(async ({ handle }) => {
  const { time, end } = await handle

  console.log('beforeHandle took', (await end) - time)
}).get("/welcome", () => `Welcome to Bun Elysia`);

app.trace(async ({ handle }) => {
  const { time, end } = await handle
  
  console.log('beforeHandle took', (await end) - time)
})

app.get('/', () => {
  return new Response("welcome!");
})

app.group('/note', configureNotesRoutes);
app.group('/customer', configureCustomerRoutes)

app.get('/hello', async () => {
  api.trace.getTracer('manual').startActiveSpan("/users/random", async (span) => {
    span.setAttribute("http.status", 200);
    span.end();
    
    return new Response("success bro");
  })
})

// setInterval(async () => {
//   api.trace.getTracer('manual').startActiveSpan('Refesh cache', async (span) => {
//       const apiResponse = await axios('https://mocki.io/v1/d4867d8b-b5d5-4a48-a4ab-79131b5809b8');
//       span.end();
//   });

// }, 60000)

app.listen(8060);


console.log(`Elysia is running`);