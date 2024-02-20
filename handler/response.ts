export function response(data: any, message: string, code: any) {
    var res = {
        'data': data,
        'messsage': message,
        'code': code
    }
    

    return res
}