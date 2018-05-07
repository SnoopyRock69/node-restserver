const jwt = require('jsonwebtoken');

/*
=====================================
        VERIFICAR TOKENS
=====================================
*/

let verificaToken = (req, res, next) => { //next continúa la ejecución del programa.

    let token = req.get('token'); //De la petición get obtengo el header "token".

    //Obtener información completa
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            })
        }
        //Cualquier tendrá acceso a la info del usuario si pasa verificatoken.
        req.usuario = decoded.usuario; //Se obtiene el Payload del usuario.
        next();
    });
};

/*
=====================================
        VERIFICA ADMIN_ROLE
=====================================
*/

let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.rol === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        })
    }
}

module.exports = {
    verificaToken,
    verificaAdmin_Role
}