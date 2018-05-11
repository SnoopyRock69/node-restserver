const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

//Para poder grabar los archivos cargados en la DB
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

//Requerimos filesystem para buscar archivos.
const fs = require('fs');

//Creamos path para indicar la ruta de los archivos cargados.
const path = require('path');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    //Si no hay un archivo.
    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo.'
                }
            });
    }

    //Validar tipo
    let tiposvalidos = ['productos', 'usuarios'];
    //Si el tipo no es válido
    if (tiposvalidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Los tipos válidos son: ' + tiposvalidos.join(', ') //Separarlas con coma y espacio.
        });
    }

    //Si hay un archivo.
    let archivo = req.files.archivo;
    //Separamos el nombre y la extensión.
    let nombreSeparado = archivo.name.split('.');
    let extension = nombreSeparado[nombreSeparado.length - 1]; //En la última posición está la extensión.
    //Extensiones de archivo válidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'pdf', 'txt', 'docx', 'xlsx', 'mp3', 'mp4'];

    //Si la extensión no es válida
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') //Separarlas con coma y espacio.
        });
    }

    /*Cambiar el nombre al archivo para evitar reescribir con el de otro usuario
     * El nombre debe ser único, por eso usarémos el id.
     */
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;


    //Lo guarda en una dirección.
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, function(err) {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });
        //Aquí ya sé que la imagen fue cargada correctamente
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        }
        if (tipo === 'productos') {
            imagenProducto(id, res, nombreArchivo);
        }

        // res.json({
        //     ok: true,
        //     message: 'Carga de archivo exitosa'
        // });
    });
});

/*
 *   FUNCIÓN PARA CARGAR ARCHIVOS EN USUARIOS
 */

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            //Llamammos la función para borrar archivos porque aquí ya existe una imagen cargada.
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            //Llamammos la función para borrar archivos porque aquí ya existe una imagen cargada.
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        //Llamammos la función para borrar archivos.
        borrarArchivo(usuarioDB.img, 'usuarios');

        // Carga la nueva imagen.
        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });

        })
    })
}

/*
 *   FUNCIÓN PARA CARGAR ARCHIVOS EN PRODUCTOS
 */

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            //Llamammos la función para borrar archivos porque aquí ya existe una imagen cargada.
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            //Llamammos la función para borrar archivos porque aquí ya existe una imagen cargada.
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        //Llamammos la función para borrar archivos.
        borrarArchivo(productoDB.img, 'productos');

        // Carga la nueva imagen.
        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });

        })
    })
}

/*
 *   FUNCIÓN PARA ELIMINAR ARCHIVOS
 */

function borrarArchivo(nombreImagen, tipo) {
    //Antes de borrar una imagen necesitamos saber que existe.
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    //Confirmar si el path existe
    if (fs.existsSync(pathImagen)) { //Regresa un true o false.
        //función para borrar archivos
        fs.unlinkSync(pathImagen);
    }
}

//Exportamos objeto de express.
module.exports = app;