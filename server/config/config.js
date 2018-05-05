//==============================================*
//                     PUERTO                   *
//==============================================*

process.env.PORT = process.env.PORT || 3000;

//==============================================*
//                     ENTORNO                  *
//==============================================*

// Para saber si estamos en "Desarrollo" o "Producción"
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; //Si no existe la variable supongo que estoy en "Desarrollo".

//==============================================*
//                  BASE DE DATOS               *
//==============================================*

let urlDB; //Variable para almacenar la conexión.

if (process.env.NODE_ENV === 'dev') {
    // Conexión local.
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //Conexión remota.
    urlDB = process.env.MONGO_URI; //conectamos a la variable de entorno creada en heroku con la dirección de mLab.
}

//Nos inventamos un environment para conectar la DB
process.env.URLDB = urlDB;