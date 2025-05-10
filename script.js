const url = "https://pokeapi.co/api/v2/pokemon?limit=151";

const pokemonContainer = document.getElementById("pokemonContainer");
const searchInput = document.getElementById("searchInput");
const pokemonSelect = document.getElementById("pokemonSelect"); // Ajout du select
const resetFilterBtn = document.getElementById("resetFilter"); // Bouton de reset
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
favorites = favorites ? JSON.parse(favorites) : [];

function toggleFavorite(name) {
    let index = favorites.indexOf(name);
    if (index === -1) {
        favorites.push(name);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayPokemon();
}

function isFavorite(name) {
    return favorites.includes(name);
}

// Récupérer les données des Pokémon
async function fetchPokemon() {
    try {
        let response = await fetch(url);
        if (!response.ok) throw new Error("Erreur lors de la récupération des données.");

        let data = await response.json();
        let pokemonDetails = [];

        for (let item of data.results) {
            let detailsResponse = await fetch(item.url);
            let details = await detailsResponse.json();

            let pokemon = {
                name: details.name,
                image: details.sprites.front_default,
                weight: details.weight,
                types: details.types.map(t => t.type.name),
            };

            pokemonDetails.push(pokemon);
        }

        allPokemon = pokemonDetails;
        populateSelect(); // Appel pour remplir le `<select>`
        displayPokemon();
    } catch (error) {
        console.error("Erreur:", error);
        pokemonContainer.innerHTML = "<p class='error'>Impossible de charger les données.</p>";
    }
}

fetchPokemon();

// Remplir le select avec les noms des Pokémon
function populateSelect() {
    pokemonSelect.innerHTML = '<option value="">-- Sélectionner un Pokémon --</option>';
    allPokemon.forEach(pokemon => {
        let option = document.createElement("option");
        option.value = pokemon.name;
        option.textContent = pokemon.name;
        pokemonSelect.appendChild(option);
    });
}

// Affichage des Pokémon avec filtres et tri
function displayPokemon() {
    pokemonContainer.innerHTML = "";
    let copy = [...allPokemon];

    // Filtrer par nom et type
    if (filter) {
        copy = copy.filter(pokemon => pokemon.name.toLowerCase().includes(filter.toLowerCase()));
    }

    if (selectValue) {
        copy = copy.filter(pokemon => pokemon.types.includes(selectValue));
    }

    // Tri
    switch (sortMethod) {
        case "az":
            copy.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "za":
            copy.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case "weightAsc":
            copy.sort((a, b) => a.weight - b.weight);
            break;
        case "weightDesc":
            copy.sort((a, b) => b.weight - a.weight);
            break;
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

// Fonction de réinitialisation
document.getElementById("resetFilter").addEventListener("click", () => {
    filter = ""; // Réinitialiser la recherche
    selectValue = ""; // Réinitialiser le filtre type
    sortMethod = ""; // Réinitialiser le tri
    displayLimit = 12; // Remettre la limite d'affichage par défaut

    // Réinitialiser les champs et boutons
    searchInput.value = ""; 
    pokemonSelect.value = ""; 
    typeFilter.value = ""; 
    displayRange.value = displayLimit;
    rangeValue.textContent = displayLimit;

    displayPokemon(); // Rafraîchir l'affichage
});



// Mode Nuit
toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    document.querySelectorAll(".pokemon-card").forEach(card => card.classList.toggle("dark-mode"));
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// Gestion des tris & filtres
sortNameAsc.addEventListener("click", () => { sortMethod = "az"; displayPokemon(); });
sortNameDesc.addEventListener("click", () => { sortMethod = "za"; displayPokemon(); });
sortWeightAsc.addEventListener("click", () => { sortMethod = "weightAsc"; displayPokemon(); });
sortWeightDesc.addEventListener("click", () => { sortMethod = "weightDesc"; displayPokemon(); });
typeFilter.addEventListener("change", (e) => { selectValue = e.target.value; displayPokemon(); });
searchInput.addEventListener("input", (e) => { filter = e.target.value; displayPokemon(); });
pokemonSelect.addEventListener("change", (e) => { filter = e.target.value; displayPokemon(); });

// Barre de réglage du nombre de Pokémon affichés
displayRange.addEventListener("input", (e) => {
    displayLimit = e.target.value;
    rangeValue.textContent = displayLimit;
    displayPokemon();
});

// Sauvegarde du mode nuit
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        document.querySelectorAll(".pokemon-card").forEach(card => card.classList.add("dark-mode"));
    }
});





