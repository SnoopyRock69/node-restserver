const express = require('express');

//Todas las peticiones a definir requiren que el usuario esté autenticado.

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

//Objeto de express.
let app = express();

//Esquema de categoria
let Categoria = require('../models/categoria');

/*==================================
    MOSTRAR TODAS LAS CATEGORÍAS
 ===================================*/

app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion') //Ordenar alfabéticamente por la propiedad "descripción"
        .populate('usuario', 'nombre email') //Revisa qué objecId existen en la categoría solicitada y me permite cargar información.
        .exec((err, categorias) => {
            if (err) { //Si hay error
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            //Si encuentra la categoría.
            res.json({
                ok: true,
                categorias
            })
        })
})

/*==================================
    MOSTRAR UNA CATEGORÍA POR ID
 ===================================*/

app.get('/categoria/:id', verificaToken, (req, res) => {
    //Categoria.findById();
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) { //Si hay error
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //Si encuentra la categoriaDB.
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es válido.'
                }
            });
        }
        //Si encuentra la categoría.
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

/*==================================
       CREAR UNA NUEVA CATEGORÍA 
 ===================================*/

app.post('/categoria', verificaToken, (req, res) => {
    //Regresa la nueva categoría.
    // el id estará en: req.usuario_id
    let body = req.body;
    //Creamos la categoria
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    //Guardamos la categoria
    categoria.save((err, categoriaDB) => {
        if (err) { //Si hay error
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //Si no se crea la categoríaDB.
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //Si se crea la categoría.
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });
})

/*==================================
       ACTUALIZA UNA CATEGORÍA 
 ===================================*/

app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };
    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        //Si hay error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //Si no se crea la categoríaDB.
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });
})

/*==================================
        ELIMINA UNA CATEGORÍA 
 ===================================*/

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //solo un admin puede eliminarla, fisicamente.
    //Debo usar el token, creo.
    //Categoria.findByIdAndRemove()
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        //Si hay error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //Si no existe la categoriaDB.
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe.'
                }
            });
        }
        res.json({
            ok: true,
            message: 'Categoría Borrada.'
        });
    });
})

//Exportamos el objeto.
module.exports = app;