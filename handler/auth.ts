import { jwt } from "@elysiajs/jwt";
import { response } from "./response";

export async function auth(bearer: any, jwt: any) { 
    const token_decoded = await jwt.verify(bearer);
    var res;
    
    if(!token_decoded){
        res = response(null, "Unauthorized", 401);
    } else {
        res = response(token_decoded, "Success", 200);
    }

    return res
}
