const favoritesContainer = document.getElementById("favoritesContainer");
const clearAllBtn = document.getElementById("clearAllFavorites"); // 🔥 Bouton dans le header
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// 🔥 Fonction pour récupérer le nom du Pokémon si c'est un numéro
async function getPokemonName(id) {
    id = parseInt(id, 10); // 🔄 Convertit "086" en "86"
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) return null;
    let data = await response.json();
    return data.name; // 🔄 Retourne le bon nom du Pokémon
}

// 🔥 Fonction principale pour récupérer et afficher les favoris
async function fetchFavorites() {
    favorites = JSON.parse(localStorage.getItem("favorites")) || []; // 🔄 Recharge les favoris

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = "<p>Aucun favori enregistré.</p>";
        return;
    }

    let fetchRequests = favorites.map(async (nameOrId) => {
        if (!isNaN(nameOrId)) { // 🔍 Si la valeur est un ID, le convertir en nom
            let name = await getPokemonName(nameOrId);
            if (!name) return null;
            return fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(res => res.ok ? res.json() : null);
        }

        return fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`)
            .then(response => response.ok ? response.json() : null);
    });

    Promise.all(fetchRequests)
        .then(pokemonDetails => {
            let validPokemon = pokemonDetails.filter(p => p !== null);
            displayFavorites(validPokemon);
        })
        .catch(error => {
            console.error("Erreur :", error);
            favoritesContainer.innerHTML = "<p class='error'>Impossible de charger les favoris.</p>";
        });
}

// 🔥 Fonction pour afficher les favoris
function displayFavorites(allPokemon) {
    favoritesContainer.innerHTML = "";
    if (allPokemon.length === 0) {
        favoritesContainer.innerHTML = "<p>Aucun favori enregistré.</p>";
        return;
    }

    allPokemon.forEach(pokemon => {
        let card = document.createElement("div");
        card.classList.add("pokemon-card");
        card.innerHTML = `
            <div class="image-container"><img src="${pokemon.sprites.front_default}" alt="${pokemon.name}"></div>
            <div class="pokemon-info">
                <h2>${pokemon.name}</h2>
                <p><strong>Poids :</strong> ${pokemon.weight}</p>
                <p><strong>Type :</strong> ${pokemon.types.map(t => t.type.name).join(", ")}</p>
                <button class="favorite-btn" data-name="${pokemon.name}">❌ Supprimer</button>
            </div>
        `;

        favoritesContainer.appendChild(card);
    });

    // 🔥 Ajoute les événements de suppression après l'affichage des cartes
    document.querySelectorAll(".favorite-btn").forEach(button => {
        button.addEventListener("click", () => {
            console.log("Suppression demandée pour :", button.dataset.name); // 🔍 Vérifie que le bouton fonctionne
            removeFavorite(button.dataset.name);
        });
    });
}

// 🔥 Correction : Supprimer un favori et recharger immédiatement l'affichage
function removeFavorite(name) {
    favorites = favorites.filter(pokemon => pokemon !== name);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    
    console.log("Favoris mis à jour :", localStorage.getItem("favorites")); // 🔄 Affiche les favoris mis à jour
    fetchFavorites(); // 🔄 Recharge immédiatement l'affichage
}

// 🔥 Suppression complète des favoris via le bouton du header
clearAllBtn.addEventListener("click", () => {
    localStorage.removeItem("favorites");
    location.reload(); // 🔄 Recharge la page après suppression
});

fetchFavorites(); // 🔥 Lance la récupération des favoris au chargement de la page



