//Importamos archivo de configuración de conexión.
require('./config/config');

//Importamos framework express para habilitar funcionalidades.
const express = require('express');

//Cargamos la libería de mongoose
const mongoose = require('mongoose');
const app = express();

//importamos bodyparser para ...
const bodyparser = require('body-parser');

app.use(bodyparser.urlencoded({ extended: false }));

app.use(bodyparser.json());

//Importamos la configuración global de rutas.
app.use(require('./routes/index'));

//Establecemos la conexión con la base de datos usando mongoose
mongoose.connect(process.env.URLDB, (err, res) => {

    if (err) throw err;
    console.log('Base de datos ONLINE');
});

//Habilitamos el puerto de escucha.
app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto: ', process.env.PORT);
})