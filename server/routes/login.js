/*
=====================================
           IMPORTAR MÓDULOS
=====================================
*/

//Requerimos express
const express = require('express');

//Requerimos bcrypt para encriptar contraseñas
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Requerimos objeto con esquema de usuario en la DB.
const Usuario = require('../models/usuario');

//Requerimos express
const app = express();

/*
=====================================
        ESTRUCTURAR PETICIONES
=====================================
*/

//Autentica con petición POST.
app.post('/login', (req, res) => {

    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) { //Si hay error.
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        //Comparar contraseña ingresada con la existente en DB.
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        //Definimos el token de seguridad (llave de acceso a usuarios autorizados).
        let token = jwt.sign({
            usuario: usuarioDB,
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); //Expira en 30 días.

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });

});

/*
=====================================
           EXPORTAR OBJETO
=====================================
*/
module.exports = app;