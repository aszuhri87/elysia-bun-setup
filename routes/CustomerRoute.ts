import { Elysia, t } from "elysia";
import { customerController } from "../controllers/CustomerController";
import * as api from '@opentelemetry/api';
import { authController } from "../controllers/AuthController";
import bearer from "@elysiajs/bearer";
import cookie from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import { response } from "../handler/response";
import { auth } from "../handler/auth";


export function configureCustomerRoutes(app: Elysia) {

    app.use(bearer()).use(cookie()).guard({
            async beforeHandle({ bearer, jwt, set}) {
                const res = await auth(bearer, jwt);

                if(res.code != 200){
                    return res;
                }
            },
        }, (guardApp) => guardApp.get('/', customerController.getCustomer)
    )

    app.guard({ body: customerController.validateCreateCustomer }, (guardApp) =>
            guardApp.post("/", customerController.createCustomer)
        );

    app.guard({ body: authController.validateAuth }, (guardApp) =>
        guardApp.post("/auth", authController.auth)
    );

    return app

    // return app
    //     .onError(({ code, error }) => {
    //         return new Response(error.toString())
    //     })
    //     .get("/", customerController.getCustomer)
    //     .guard({ body: customerController.validateCreateCustomer }, (guardApp) =>
    //         guardApp.post("/", customerController.createCustomer)
    //     );
}