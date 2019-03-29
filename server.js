    const express = require('express');
    const bodyParser = require("body-parser");

    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));

    //app.use(express.static('public'));

    const mongoose = require('mongoose');

    // connect to the database
    mongoose.connect('mongodb://localhost:27017/pokedex', {
        useNewUrlParser: true
    });

    // Configure multer so that it will upload to '/public/images'
    const multer = require('multer')
    const upload = multer({
        dest: '/var/www/cp4.annielarkins.com/images/',
        limits: {
            fileSize: 10000000
        }
    });

    // Create a scheme for a pokemon: name, type, and a path to an image.
    const pokeSchema = new mongoose.Schema({
        name: String,
        type: String,
        path: String,
    });

    // Create a virtual paramter that turns the default _id field into id
    pokeSchema.virtual('id')
        .get(function () {
            return this._id.toHexString();
        });

    // Ensure virtual fields are serialised when we turn this into a JSON object
    pokeSchema.set('toJSON', {
        virtuals: true
    });

    // Create a model for pokemon in the pokedex
    const Pokemon = mongoose.model('Pokemon', pokeSchema);

    // Upload a photo. Uses the multer middleware for the upload and then returns
    // the path where the photo is stored in the file system.
    app.post('/api/photos', upload.single('photo'), async (req, res) => {
        // Just a safety check
        if (!req.file) {
            return res.sendStatus(400);
        }
        res.send({
            path: "/images/" + req.file.filename
        });
    });

    // Create a new pokemon
    app.post('/api/pokemons', async (req, res) => {
        const pokemon = new Pokemon({
            name: req.body.name,
            type: req.body.type,
            path: req.body.path,
        });
        try {
            await pokemon.save();
            res.send(pokemon);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    });

    // Get a list of all of the pokemon
    app.get('/api/pokemons', async (req, res) => {
        try {
            let pokemons = await Pokemon.find();
            res.send(pokemons);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    });

    // Delete a pokemon
    app.delete('/api/pokemons/:id', async (req, res) => {
        try {
            await Pokemon.deleteOne({
                _id: req.params.id
            });
            res.sendStatus(200);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    });

    // Edit a pokemon
    app.put('/api/pokemons/:id', async (req, res) => {
        try {
            let pokemon = await Pokemon.findOne({
                _id: req.params.id
            });
            pokemon.name = req.body.name;
            pokemon.type = req.body.type;
            pokemon.path = req.body.path;
            pokemon.save();
            res.sendStatus(200);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
        this.editing = null;
    });

    app.listen(3000, () => console.log('Server listening on port 3000!'));
