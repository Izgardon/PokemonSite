//Config
const apiUrl = window.POKEMON_API_URL;

//Components
const pokemonContainer = document.getElementById('pokemonContainer');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');

//Variables
let allPokemon = [];
let filteredPokemon = [];

//Check to see if data is in cache, if not call api
function checkCache() {
    let pokemonData = localStorage.getItem('pokemonData');
    console.log(pokemonData);
    console.log('hello');

    if(!pokemonData){
        fetchPokemon()
    }
}

// Fetching pokemon from API
async function fetchPokemon(){
     await axios.get(`${apiUrl}?limit=151`).then((resp) => {
        localStorage.setItem('pokemonData', response.data.results);
        const pokemonList = resp.data.results;
        displayPokemon(pokemonList);
    }).catch((err) => {
        console.error('Error fetching Pokémon:', err);
    }); 
}

// Display Pokémon on the page using CSS Grid
function displayPokemon(pokemonList) {
    pokemonContainer.innerHTML = '';

    pokemonList.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');
        pokemonCard.textContent = pokemon.name;
        pokemonCard.addEventListener('click', () => openModal(pokemon.name));

        pokemonContainer.appendChild(pokemonCard);
    });
}

// Open modal with detailed Pokémon information
async function openModal(pokemonName) {
    try {
        const response = await axios.get(`${apiUrl}/${pokemonName}`);
        const pokemonData = response.data;

        const modalHtml = `
            <h2>${pokemonData.name}</h2>
            <img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}">
            <p>Height: ${pokemonData.height}</p>
            <p>Weight: ${pokemonData.weight}</p>
        `;

        modalContent.innerHTML = modalHtml;
        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error fetching Pokémon details:', error);
    }
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
}

// Initial fetch
checkCache();
