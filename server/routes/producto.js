const express = require('express');

//Todas las peticiones a definir requiren que el usuario esté autenticado.

let { verificaToken } = require('../middlewares/autenticacion');

//Inicializar objeto de express.
let app = express();

//Esquema de categoria
let Producto = require('../models/producto');


/*=============================================
           OBTENER TODOS LOS PRODUCTOS
===============================================*/

app.get('/producto', verificaToken, (req, res) => {

    //Paginar solicitud.
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 2;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) { //Si hay error
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            //Si encuentra el producto..
            res.json({
                ok: true,
                productos
            })
        })
})


/*=============================================
           OBTENER UN PRODUCTO POR ID
===============================================*/

app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    //Paginar solicitud.
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.findById(id)
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) { //Si hay error
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no es válido.'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB,
            })
        })
})

/*=============================================
                BUSCAR UN PRODUCTO
===============================================*/

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    //Expresión regular para mejorar la búsqueda.
    let regex = new RegExp(termino, 'i'); //La 'i' es para que sea insensible a mayúsculas y minúsculas
    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            })
        })
})

/*=============================================
                CREAR UN PRODUCTO
===============================================*/

app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;
    //Creamos el producto
    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });
    //Guardamos el productoDB.
    producto.save((err, productoDB) => {
        if (err) { //Si hay error
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si se crea el producto.
        res.status(201).json({ //201 cuando se crea un registro.
            ok: true,
            producto: productoDB
        })
    });
})

/*=============================================
             ACTUALIZAR UN PRODUCTO
===============================================*/

app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let actualizarProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        categoria: body.categoria,
        disponible: body.disponible,
        descripcion: body.descripcion
    };
    Producto.findByIdAndUpdate(id, actualizarProducto, { new: true, runValidators: true }, (err, productoDB) => {
        //Si hay error        
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe.'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        })
    });
})

/*=============================================
        BORRAR(inhabilitar) UN PRODUCTO
===============================================*/
app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let cambiaEstado = {
        disponible: false
    }
    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (!productoBorrado) { //Si no existe.
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoBorrado,
            message: 'Producto Borrado'
        });
    });
})


// EXPORTAMOS EL OBJETO DE EXPRESS
module.exports = app;