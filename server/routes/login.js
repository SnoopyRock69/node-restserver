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
//Constantes de google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
//Requerimos objeto con esquema de usuario en la DB.
const Usuario = require('../models/usuario');
//Requerimos express
const app = express();
/*
=====================================
        ESTRUCTURAR PETICIONES
=====================================
*/
//Autenticación con petición POST.
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
       CONFIGURACIONES DE GOOGLE
=====================================
*/
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    console.log(payload.name);
    console.log(payload.email);
    console.log(payload.picture);
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
//PETICIÓN POST PARA GOOGLE SIGN-IN
app.post('/google', async(req, res) => {

    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });

        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {

                let token = jwt.sign({
                    usuario: usuarioDB,
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); //Expira en 30 días.
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            }
        } else {

            // Si el usuario no existe en nuestra DB.
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                let token = jwt.sign({
                    usuario: usuarioDB,
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); //Expira en 30 días.
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});

/*
=====================================
           EXPORTAR OBJETO
=====================================
*/
module.exports = app;