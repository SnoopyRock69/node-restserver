//Importamos mongoose y mongoose-unique-validator
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


//           Aquí definimos los roles válidos              //

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'], //se escriben como esperamos recibirlos sintácticamente hablando.
    message: '{VALUE} no es un rol válido'
}

//Creamos un esquema de mongoose.
let Schema = mongoose.Schema;

//Definimos los campos que tendrá nuestra colección en la DB.
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario'] //Es obligatorio y si no se cumple imprime el msj.
    },
    email: {
        type: String,
        index: true, //para poder actualizarlo
        unique: true, //Esto hará que el correo sea único e irrepetible.
        required: [true, 'El email es necesario']
    },
    password: {
        type: String,
        required: [true, 'Es obligatorio ingresar su contraseña']

    },
    img: { //No es obligatoria
        type: String,
        required: false
    },
    rol: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: { //Booleano
        type: Boolean,
        default: true
    },
    google: { //Booleano
        type: Boolean,
        default: false
    }
});

//Evitamos retornar la contraseña
usuarioSchema.methods.toJSON = function() {
    let user = this;
    //Tomamos el objeto del usuario. Adquirimos todas sus propiedades
    let userObject = user.toObject();
    //Quitamos la contraseña del objeto.
    delete userObject.password;

    return userObject;
}

//Especificamos al esquema el plugin que usará. uniqueValidator para validar la propiedad unique.
usuarioSchema.plugin(uniqueValidator, { message: 'Este {PATH} ya se encuentra registrado. Debe ser único.' });

//Exportamos el modelo de la tabla de usuario.
module.exports = mongoose.model('Usuario', usuarioSchema); //El nombre que se le dará físicamente a este modelo.