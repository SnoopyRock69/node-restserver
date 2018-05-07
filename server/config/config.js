//==============================================*
//          CONFIGURACIÓN DEL PUERTO            *
//==============================================*

process.env.PORT = process.env.PORT || 3000;

//==============================================*
//         IDENTIFICACIÓN DEL ENTORNO           *
//==============================================*

// Para saber si estamos en "Desarrollo" o "Producción"
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; //Si no existe la variable supongo que estoy en "Desarrollo".

//==============================================*
//            VENCIMIENTO DEL TOKEN             *
//==============================================*
//                 60 SEGUNDOS                  *
//                 60 MINUTOS                   *
//                 24 HORAS                     *
//                 30 DÍAS                      *
//==============================================*

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;



//==============================================*
//       SEDD (SEMILLA) DE AUTENTICACIÓN        *
//==============================================*

process.env.SEED = process.env.SEED || 'esto-es-el-seed-desarrollo';


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