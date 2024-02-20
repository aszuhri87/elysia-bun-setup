import { describe, expect, it } from 'bun:test'
import Elysia from 'elysia'
import { notesController } from "../controllers/NotesController";

describe('Elysia', () => {
    it('return a response', async () => {
        const app = new Elysia().get('/', () => {
          return  {data : "ok", code: 200}
        })

        const response = await app
            .handle(new Request('http://localhost/'))
            .then((res) => res)

        expect(response.status).toBe(200)
        expect(response).toBeObject();
    })
})

describe('Note', () => {
    it('return a response', async () => {
        const app = new Elysia().get('/', notesController.getNotes)

        const response = await app
            .handle(new Request('http://localhost/'))
            .then((res) => res)

        expect(response.status).toBe(200)
        expect(response).toBeObject();
    })
})