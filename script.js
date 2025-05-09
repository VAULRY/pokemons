const url = "https://pokeapi.co/api/v2/pokemon?limit=151";

const pokemonContainer = document.getElementById("pokemonContainer");
const searchInput = document.getElementById("searchInput");
const sortNameAsc = document.getElementById("sortNameAsc");
const sortNameDesc = document.getElementById("sortNameDesc");
const sortWeightAsc = document.getElementById("sortWeightAsc");
const sortWeightDesc = document.getElementById("sortWeightDesc");
const typeFilter = document.getElementById("typeFilter");
const toggleThemeBtn = document.getElementById("toggleTheme");
const displayRange = document.getElementById("displayRange");
const rangeValue = document.getElementById("rangeValue");

var allPokemon = [];
var displayLimit = 12;
var sortMethod = "";
var filter = "";
var selectValue = "";

// Gestion des favoris avec localStorage
let favorites = localStorage.getItem("favorites");
if (favorites == null) {
    favorites = [];
} else {
    favorites = JSON.parse(favorites);
}

function toggleFavorite(name) {
    let index = favorites.indexOf(name);
    if (index == -1) {
        favorites[favorites.length] = name;
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayPokemon();
}

function isFavorite(name) {
    return favorites.indexOf(name) != -1;
}

// Récupérer les données des Pokémon
async function fetchPokemon() {
    try {
        let response = await fetch(url);
        if (response.ok == false) {
            throw new Error("Erreur lors de la récupération des données.");
        }

        let data = await response.json();
        let pokemonDetails = [];

        for (let i = 0; i < data.results.length; i++) {
            let detailsResponse = await fetch(data.results[i].url);
            let details = await detailsResponse.json();

            let pokemon = {
                name: details.name,
                image: details.sprites.front_default,
                weight: details.weight,
                types: []
            };

            for (let j = 0; j < details.types.length; j++) {
                pokemon.types[pokemon.types.length] = details.types[j].type.name;
            }

            pokemonDetails[pokemonDetails.length] = pokemon;
        }

        allPokemon = pokemonDetails;
        displayPokemon();
    } catch (error) {
        console.error("Erreur:", error);
        pokemonContainer.innerHTML = "<p class='error'>Impossible de charger les données.</p>";
    }
}
fetchPokemon();

// Affichage des Pokémon avec filtres et tri
function displayPokemon() {
    pokemonContainer.innerHTML = "";
    let copy = [];
    
    for (let i = 0; i < allPokemon.length; i++) {
        copy[copy.length] = allPokemon[i];
    }

    // Filtrer par nom et type
    if (filter != "") {
        let filteredCopy = [];
        for (let i = 0; i < copy.length; i++) {
            if (copy[i].name.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
                filteredCopy[filteredCopy.length] = copy[i];
            }
        }
        copy = filteredCopy;
    }

    if (selectValue != "") {
        let filteredCopy = [];
        for (let i = 0; i < copy.length; i++) {
            if (copy[i].types.indexOf(selectValue) != -1) {
                filteredCopy[filteredCopy.length] = copy[i];
            }
        }
        copy = filteredCopy;
    }

    // Tri
    if (sortMethod == "az") {
        copy.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortMethod == "za") {
        copy.sort((a, b) => b.name.localeCompare(a.name));
    }
    if (sortMethod == "weightAsc") {
        copy.sort((a, b) => a.weight - b.weight);
    }
    if (sortMethod == "weightDesc") {
        copy.sort((a, b) => b.weight - a.weight);
    }

    // Afficher les Pokémon
    for (let i = 0; i < Math.min(displayLimit, copy.length); i++) {
        pokemonContainer.innerHTML += `
        <div class="pokemon-card ${document.body.classList.contains('dark-mode') ? 'dark-mode' : ''}">
            <div class="image-container"><img src="${copy[i].image}" alt="${copy[i].name}"></div>
            <div class="pokemon-info">
                <h2>${copy[i].name}</h2>
                <p><strong>Poids :</strong> ${copy[i].weight}</p>
                <p><strong>Type :</strong> ${copy[i].types.join(", ")}</p>
                <button class="favorite-btn" onclick="toggleFavorite('${copy[i].name}')">
                    ${isFavorite(copy[i].name) ? '⭐ Retirer des favoris' : '☆ Ajouter aux favoris'}
                </button>
            </div>
        </div>`;
    }
}

// Mode Nuit
toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    let cards = document.getElementsByClassName("pokemon-card");
    for (let i = 0; i < cards.length; i++) {
        cards[i].classList.toggle("dark-mode");
    }
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// Gestion des tris & filtres
sortNameAsc.addEventListener("click", () => { sortMethod = "az"; displayPokemon(); });
sortNameDesc.addEventListener("click", () => { sortMethod = "za"; displayPokemon(); });
sortWeightAsc.addEventListener("click", () => { sortMethod = "weightAsc"; displayPokemon(); });
sortWeightDesc.addEventListener("click", () => { sortMethod = "weightDesc"; displayPokemon(); });
typeFilter.addEventListener("change", (e) => { selectValue = e.target.value; displayPokemon(); });
searchInput.addEventListener("input", (e) => { filter = e.target.value; displayPokemon(); });

// Barre de réglage du nombre de Pokémon affichés
displayRange.addEventListener("input", (e) => {
    displayLimit = e.target.value;
    rangeValue.innerHTML = displayLimit;
    displayPokemon();
});

// Sauvegarde du mode nuit
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") == "dark") {
        document.body.classList.add("dark-mode");
        let cards = document.getElementsByClassName("pokemon-card");
        for (let i = 0; i < cards.length; i++) {
            cards[i].classList.add("dark-mode");
        }
    }
});

