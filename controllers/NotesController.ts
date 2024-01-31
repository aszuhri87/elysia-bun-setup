import { t } from "elysia";
import { PrismaClient } from "@prisma/client";
import { response } from "./../handler/response"

const db = new PrismaClient();

export const notesController = {
    getNotes: async ({ query }) => {
        try {
            var result =  db.notes.findMany({
                where: {
                    title: {
                        contains: query.title
                    }
                }
            });

            return response(await result, "success", 200);
        } catch (error) {
            return response(null, "error", 500);
        }
    },

    createNote: async ({ body, set }) => {
        await db.notes.create({
            data: {
                id: body.id,
                title: body.title,
                body: body.body,
                tags: body.tags,
                owner: body.owner,
            }
        });
        set.status = 201;
        return `Data ${body.title} successfully created!`;
    },

    validateCreateNote: t.Object({
        id: t.String(),
        title: t.String(),
        body: t.String(),
        tags: t.String(),
        owner: t.String()
    })
};
