const express = require('express');
const fs = require('fs');
const path = require('path');

const { verificaTokenImg } = require('../middlewares/autenticacion');

let app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    //Path absoluto de las imágenes que han sido cargadas por usuarios.
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    //Si existe la imagene en el path
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        //Path absoluto de la imagen por defecto.
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        //Enviamos imagen por defecto
        res.sendFile(noImagePath);
    }
});

//Exportar objeto de express.
module.exports = app;