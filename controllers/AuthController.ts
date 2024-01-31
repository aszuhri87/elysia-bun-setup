import { t } from "elysia";
import { PrismaClient } from "@prisma/client";
import * as api from '@opentelemetry/api';
import axios from "axios";
import jwt from "@elysiajs/jwt";
import cookie from "@elysiajs/cookie";
import { response } from "../handler/response";

const db = new PrismaClient();

export const authController = {
    auth: async ({ body, jwt }) => {
        var user = await db.customer.findFirst({
            where: {
                username: {
                    contains: body.username
                }
            },
            select: {
                id: false,
                name: true,
                username: true,
                password: true
              },
        });

        var hash = user.password;
        
        const check_pwd = await Bun.password.verify(body.password, hash);
        

        if(!check_pwd){
            return response(null, "Unauthorized", 401);
        }

        var payload = {
            'username': user.username,
            'id': user.id,
            'name': user.name
        }

        var token = await jwt.sign(payload);

        return response(token, "success", 200);
    },

    validateAuth: t.Object({
        username: t.String(),
        password: t.String()
    })
}