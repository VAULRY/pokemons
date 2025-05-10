const url = "https://pokeapi.co/api/v2/pokemon?limit=151";

const pokemonContainer = document.getElementById("pokemonContainer");
const searchInput = document.getElementById("searchInput");
const pokemonSelect = document.getElementById("pokemonSelect");
const resetFilterBtn = document.getElementById("resetFilter");
const sortNameAsc = document.getElementById("sortNameAsc");
const sortNameDesc = document.getElementById("sortNameDesc");
const sortWeightAsc = document.getElementById("sortWeightAsc");
const sortWeightDesc = document.getElementById("sortWeightDesc");
const typeFilter = document.getElementById("typeFilter");
const toggleThemeBtn = document.getElementById("toggleTheme");
const displayRange = document.getElementById("displayRange");
const rangeValue = document.getElementById("rangeValue");

// 🔥 Fenêtre modale
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalImage = document.getElementById("modalImage");
const modalInfo = document.getElementById("modalInfo");
const closeBtn = document.querySelector(".close-btn");

var allPokemon = [];
var displayLimit = 12;
var sortMethod = "";
var filter = "";
var selectValue = "";
var selectedPokemon = "";

// 🔥 Gestion des favoris avec localStorage
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function toggleFavorite(name) {
    if (!favorites.includes(name)) {
        favorites.push(name);
    } else {
        favorites = favorites.filter(p => p !== name);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayPokemon();
}

function isFavorite(name) {
    return favorites.includes(name);
}

// 🔥 Récupérer les données des Pokémon
async function fetchPokemon() {
    try {
        let response = await fetch(url);
        if (!response.ok) throw new Error("Erreur lors de la récupération des données.");

        let data = await response.json();
        let pokemonDetails = [];
        let allTypes = new Set();

        for (let i = 0; i < data.results.length; i++) {
            let detailsResponse = await fetch(data.results[i].url);
            let details = await detailsResponse.json();

            // 🔥 Structure complète du Pokémon avec statistiques et capacités
            let pokemon = {
                name: details.name,
                image: details.sprites.front_default,
                weight: details.weight,
                types: details.types.map(t => t.type.name),
                base_experience: details.base_experience,
                stats: details.stats.map(s => ({
                    name: s.stat.name,
                    value: s.base_stat
                })),
                abilities: details.abilities.map(a => a.ability.name)
            };

            pokemonDetails.push(pokemon);
            details.types.forEach(type => allTypes.add(type.type.name)); // 🔥 Stocker tous les types disponibles
        }


        allPokemon = pokemonDetails;
        populateTypeSelect(allTypes);
        populatePokemonSelect();
        displayPokemon();
    } catch (error) {
        console.error("Erreur:", error);
        pokemonContainer.innerHTML = "<p class='error'>Impossible de charger les données.</p>";
    }
}

fetchPokemon();

// 🔥 Fonction pour afficher la fenêtre modale avec toutes les infos du Pokémon
function showDetails(pokemon) {
    modalTitle.textContent = pokemon.name;
    modalImage.src = pokemon.image;
    modalInfo.innerHTML = `
        <p><strong>Poids :</strong> ${pokemon.weight}</p>
        <p><strong>Type :</strong> ${pokemon.types.join(", ")}</p>
        <p><strong>Expérience de base :</strong> ${pokemon.base_experience}</p>
    `;

    // 🔥 Ajout des statistiques
    modalStats.innerHTML = "";
    pokemon.stats.forEach(stat => {
        let li = document.createElement("li");
        li.textContent = `${stat.name}: ${stat.value}`;
        modalStats.appendChild(li);
    });

    // 🔥 Ajout des capacités
    modalAbilities.innerHTML = "";
    pokemon.abilities.forEach(ability => {
        let li = document.createElement("li");
        li.textContent = ability;
        modalAbilities.appendChild(li);
    });

    modal.style.display = "block";
}

// 🔥 Fermer la fenêtre modale
closeBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});


displayRange.addEventListener("input", (e) => {
    displayLimit = parseInt(e.target.value, 10); // 🔥 Convertit bien la valeur en nombre
    rangeValue.textContent = displayLimit; // 🔥 Met à jour l'affichage du nombre
    displayPokemon(); // 🔄 Recharge immédiatement la liste des Pokémon
});



// 🔥 Remplir le menu déroulant des types
function populateTypeSelect(types) {
    typeFilter.innerHTML = '<option value="">-- Sélectionner un type --</option>';
    types.forEach(type => {
        let option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });
}

// 🔥 Remplir le menu déroulant des Pokémon
function populatePokemonSelect() {
    pokemonSelect.innerHTML = '<option value="">-- Sélectionner un Pokémon --</option>';
    allPokemon.forEach(pokemon => {
        let option = document.createElement("option");
        option.value = pokemon.name;
        option.textContent = pokemon.name;
        pokemonSelect.appendChild(option);
    });
}

// 🔥 Affichage des Pokémon avec filtres et tri
function displayPokemon() {
    pokemonContainer.innerHTML = "";
    let copy = [...allPokemon];

    if (filter) {
        copy = copy.filter(pokemon => pokemon.name.toLowerCase().includes(filter.toLowerCase()));
    }

    if (selectValue) {
        copy = copy.filter(pokemon => pokemon.types.includes(selectValue));
    }

    if (selectedPokemon) {
        copy = copy.filter(pokemon => pokemon.name === selectedPokemon);
    }

    switch (sortMethod) {
        case "az": copy.sort((a, b) => a.name.localeCompare(b.name)); break;
        case "za": copy.sort((a, b) => b.name.localeCompare(a.name)); break;
        case "weightAsc": copy.sort((a, b) => a.weight - b.weight); break;
        case "weightDesc": copy.sort((a, b) => b.weight - a.weight); break;
    }

    copy.slice(0, displayLimit).forEach(pokemon => {
        let card = document.createElement("div");
        card.classList.add("pokemon-card");
        card.innerHTML = `
        <div class="image-container"><img src="${pokemon.image}" alt="${pokemon.name}"></div>
        <div class="pokemon-info">
            <h2>${pokemon.name}</h2>
            <p><strong>Poids :</strong> ${pokemon.weight}</p>
            <p><strong>Type :</strong> ${pokemon.types.join(", ")}</p>
            <button class="favorite-btn" onclick="toggleFavorite('${pokemon.name}')">
                ${isFavorite(pokemon.name) ? '⭐ Retirer des favoris' : '☆ Ajouter aux favoris'}
            </button>
        <button class="details-btn" data-name="${pokemon.name}">ℹ Voir détails</button> <!-- 🔥 Ajout du bouton -->
        </div>

        </div>`;
        
        pokemonContainer.appendChild(card);
    });
}
// 🔥 Événement pour ouvrir la fenêtre modale
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("details-btn")) {
        let pokemonName = event.target.dataset.name;
        let pokemon = allPokemon.find(p => p.name === pokemonName);
        if (pokemon) {
            showDetails(pokemon);
        }
    }
});



// 🔥 Gestion des tris & filtres
sortNameAsc.addEventListener("click", () => { sortMethod = "az"; displayPokemon(); });
sortNameDesc.addEventListener("click", () => { sortMethod = "za"; displayPokemon(); });
sortWeightAsc.addEventListener("click", () => { sortMethod = "weightAsc"; displayPokemon(); });
sortWeightDesc.addEventListener("click", () => { sortMethod = "weightDesc"; displayPokemon(); });
typeFilter.addEventListener("change", (e) => { selectValue = e.target.value; displayPokemon(); });
searchInput.addEventListener("input", (e) => { filter = e.target.value; displayPokemon(); });
pokemonSelect.addEventListener("change", (e) => { selectedPokemon = e.target.value; displayPokemon(); });

// 🔥 Mode Nuit
toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// 🔥 Réinitialisation complète
resetFilterBtn.addEventListener("click", () => {
    filter = "";
    selectValue = "";
    selectedPokemon = "";
    sortMethod = "";
    displayLimit = 12;

    searchInput.value = "";
    pokemonSelect.value = "";
    typeFilter.value = "";
    displayRange.value = 12;
    rangeValue.textContent = 12;

    displayPokemon();
});

// 🔥 Sauvegarde du mode nuit
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
});


