require('./config/config');

const express = require('express');
const app = express();

const bodyparser = require('body-parser');

app.use(bodyparser.urlencoded({ extended: false }));

app.use(bodyparser.json());

//GET
app.get('/usuario', function(req, res) {
    res.json('Get usuario')
})

//POST
app.post('/usuario', function(req, res) {
    let body = req.body;

    if (body.nombre === undefined) {

        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });

    } else {
        res.json({
            body
        });
    }

})

//PUT
app.put('/usuario/:id', function(req, res) {
    let id = req.params.id; //Obtener id del usuario.
    res.json({
        id
    });
})

//DELETE
app.delete('/usuario', function(req, res) {
    res.json('Delete usuario')
})


//Habilitamos el puerto de escucha.
app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto: ', process.env.PORT);
})