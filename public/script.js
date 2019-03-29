var app = new Vue({
    el: '#app',
    data: {
        name: "",
        type: "",
        newType: "",
        file: null,
        pokemons: [],
        addPokemon: null,
        findName: "",
        findPokemon: null,
        editing: null,
        notEditing: true,
        displayPokeball: true,
        newPic: false,
    },
    created() {
        this.getPokemons();
    },
    methods: {
        fileChanged(event) {
            this.file = event.target.files[0];
            this.newPic = true;
        },
        async upload() {
            console.log("IN UPLOAD");
            try {
                const formData = new FormData();
                formData.append('photo', this.file, this.file.name);
                let r1 = await axios.post('/api/photos', formData);
                let r2 = await axios.post('/api/pokemons', {
                    name: this.name,
                    type: this.type,
                    path: r1.data.path
                });
                this.addPokemon = r2.data;
                this.displayPokeball = false;
                this.newPic = false;
            } catch (error) {
                console.log(error);
            }
        },
        async getPokemons() {
            try {
                let response = await axios.get("/api/pokemons");
                this.pokemons = response.data;
                return true;
            } catch (error) {
                console.log(error);
            }
        },
        selectPokemon(pokemon) {
            this.findName = "";
            this.findPokemon = pokemon;
        },
        async deletePokemon(pokemon) {
            try {
                let response = axios.delete("/api/pokemons/" + pokemon._id);
                this.findPokemon = null;
                this.getPokemons();
                return true;
            } catch (error) {
                console.log(error);
            }
        },
        async editPokemon(newPokemon) {
            try {
                this.editPokemon = "";
                if (this.newPic) {
                    const formData = new FormData();
                    formData.append('photo', this.file, this.file.name)
                    let r1 = await axios.post('/api/photos', formData);
                    console.log(newPokemon);
                    let response = await axios.put("/api/pokemons/" + newPokemon._id, {
                        name: newPokemon.name,
                        type: newPokemon.type,
                        path: r1.data.path,
                    });
                } else {
                    let response = await axios.put("/api/pokemons/" + newPokemon._id, {
                        name: newPokemon.name,
                        type: newPokemon.type,
                        path: newPokemon.path,
                    });
                }
                console.log("BELOW");
                this.findPokemon = null;
                this.notEditing = true;
                this.editing = null;
                this.displayPokeball = true;
                this.newPic = false;
                this.getPokemons();
                return true;
            } catch (error) {
                console.log(error);
            }
        },
        upperDisplay(pokemon) {
            console.log("IN DISPLAY")
            this.editing = pokemon;
            this.notEditing = false;
            this.displayPokeball = false;
            this.addPokemon = null;
        },
    }
});
