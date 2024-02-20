import { t } from "elysia";
import { PrismaClient } from "@prisma/client";
import * as api from '@opentelemetry/api';
import axios from "axios";
import cookie from "@elysiajs/cookie";
import { auth } from "../handler/auth";
import jwt from "@elysiajs/jwt";
import { response } from "../handler/response";
import { before } from "node:test";
import { password } from "bun";
import exp from "constants";

const db = new PrismaClient();

export const customerController = {
    getCustomer: async ({ query, bearer, jwt }) => {
        const user = await auth(bearer, jwt)

        return db.customer.findMany({
            where: {
                name: {
                    contains: user.data.name
                }
            },
            select: {
                id: false,
                name: true,
              },
        });
    },


    createCustomer: async ({ body, set, bearer, jwt }) => {
        const check_user = await auth(bearer, jwt);

        if(check_user.code == 401){
            set.status = 401;
            return check_user;
        }

        await db.customer.create({
            data: {
                id: body.id,
                name: body.name,
                username: body.username,
                password: await Bun.password.hash(body.password, {
                    algorithm: "bcrypt",
                    cost: 4, // number between 4-31
                })
            }
        });
        set.status = 201;
        return `Data ${body.name} successfully created!`;
        
    },

    validateCreateCustomer: t.Object({
        id: t.String(),
        name: t.String(),
        username: t.String(),
        password: t.String()
    })
};
