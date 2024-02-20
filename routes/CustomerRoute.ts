import { Elysia } from "elysia";
import { customerController } from "../controllers/CustomerController";
import { authController } from "../controllers/AuthController";
import bearer from "@elysiajs/bearer";
import cookie from "@elysiajs/cookie";
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
}