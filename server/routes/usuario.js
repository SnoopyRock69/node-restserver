//Requerimos express
const express = require('express');

//Requerimos bcrypt para encriptar contraseñas
const bcrypt = require('bcrypt');

//Requerimos underscore para extrar campos específicos de la DB.
const _ = require('underscore');

//Objeto con esquema de usuario en la DB.
const Usuario = require('../models/usuario');

//Importamos función para verificar token.
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

//Requerimos express
const app = express();

//GET: Obtener información de la DB.
app.get('/usuario', verificaToken, (req, res) => {

    //Los parámetros opcionales caen en un objeto llamado req.query
    //Suponemos que viene una variable "desde", si no inicia en 0, primera posición.
    let desde = req.query.desde || 0; //Si no hay inicia en cero.
    desde = Number(desde); //Debe convertirse a un número.
    let limite = req.query.limite || 5; //Si no se define el límite por defecto es 5.
    limite = Number(limite);
    //Para obtener info de la DB se hace referencia al esquema.
    //find busca todo, hay otros métodos como findone para traer uno específico.
    //el segundo parámetro es para indicar qué propiedades se quiere mostrar.
    Usuario.find({ estado: true }, 'nombre email rol estado google') // le decimos que busque los que tienen estado true y los retorne.
        .skip(desde) //salta registros
        .limit(limite) //retorna registros
        .exec((err, usuarios) => { //lo que recibe se almacena en usuarios.
            if (err) { //Si hay error
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            //Si no hay error enviámos el objeto.

            Usuario.count({ estado: true }, (err, conteo) => { //contamos el número de registro en la DB.
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            })

        }) // exec para ejecutar el find.
})

//POST: enviar información a la DB.
app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {
    let body = req.body;
    // Creamos nueva instancia con esquema Usuario.
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), //Encriptamos la contraseña.
        rol: body.rol
    });

    //Enviamos la información de usuario a la DB.
    usuario.save((err, usuarioDB) => { //usuarioDB es la respuesta el usuario que se grabó en mongo.

        /*Evitamos que se vea la contraseña encriptada.
        usuarioDB.password = null;*/

        //Si no hay error
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
})

//PUT: actualizar información en la DB.
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    //Obtener id del usuario.
    let id = req.params.id;

    /*
     * Usamos la función pick() del módulo underscore para definir
     * qué puede o no ser actualizado. Recibe el objeto que tiene 
     * todas las propiedades.
     */

    let body = _.pick(req.body, ['nombre', 'email', 'img', 'rol', 'estado']);

    //id, objeto a actualizar, opción para retornar objeto actualizado y un callback.
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
})

//DELETE
app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    //Primero requerimos el id.
    let id = req.params.id;

    /*/=========================================//
     *            ELIMINANDO REGISTRO           *
    //=========================================/*/

    // //Eliminar registro de DB completamente
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     };
    //     if (!usuarioBorrado) { //Si no existe.
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         });
    //     }
    //     res.json({
    //         ok: true,
    //         usuario: usuarioBorrado
    //     });
    // });

    /*/=========================================//
    *            SIN ELIMINAR REGISTRO          *
    //=========================================/*/

    //Si no quiero eliminar el registro, podría hacer algo así:
    let cambiaEstado = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
        if (!usuarioBorrado) { //Si no existe.
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
})

//Exportamos para habilitar uso externo.
module.exports = app;