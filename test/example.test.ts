import { describe, expect, it } from 'bun:test'
import Elysia from 'elysia'
import { configureNotesRoutes } from "../routes/NotesRoute";

describe('Elysia', () => {
    it('return a response', async () => {
        const app = new Elysia().get('/', () => {
          return  {data : "ok"}
        })

        const response = await app
            .handle(new Request('http://localhost/'))
            .then((res) => res)

        expect(response).toBeObject();
    })
})

describe('Note', () => {
    it('return a response', async () => {
        const app = new Elysia().get('/note/', configureNotesRoutes)

        const response = await app
            .handle(new Request('http://localhost/'))
            .then((res) => res)

        expect(response).toBeObject();
    })
})