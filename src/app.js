//Config--------------

const apiUrl = window.POKEMON_API_URL;

//Components------------

const pokemonContainer = document.getElementById('pokemonContainer');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const searchInput = document.getElementById('search');

//Variables------------

let allPokemon = [];
let filteredPokemon = [];

//Event listeners--------

//For listening for typing
searchInput.addEventListener('input', handleSearch);

//Methods-------

//Check to see if data is in cache, if not call api
function checkCache() {
    let pokemonList = JSON.parse(localStorage.getItem('pokemonData'));
    if(!pokemonList){
        fetchPokemon()
    } else {
        allPokemon = pokemonList
        displayPokemon()
    }
}

// Fetching pokemon from API
async function fetchPokemon(){
     await axios.get(`${apiUrl}?limit=151`).then((resp) => {
        allPokemon = resp.data.results;
        localStorage.setItem('pokemonData', JSON.stringify(allPokemon));
        displayPokemon();
    }).catch((err) => {
        console.error('Error fetching Pokémon:', err);
    }); 
}

// Display Pokémon on the page using CSS Grid
function displayPokemon() {
    pokemonContainer.innerHTML = '';

    allPokemon.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');
        pokemonCard.textContent = pokemon.name;
        pokemonCard.addEventListener('click', () => openModal(pokemon.name));

        pokemonContainer.appendChild(pokemonCard);
    });
}

// Search functionality
function handleSearch() {
    console.log(searchInput.value.toLowerCase())
        /* const filteredPokemonList = allPokemon.filter(pokemon => pokemon.name.includes(searchInput.toLowerCase()));
        displayPokemon(filteredPokemonList); */
}

// Open Modal and fetch more data
async function openModal(pokemonName) {
    try {
        const response = await axios.get(`${apiUrl}/${pokemonName}`);
        const pokemonData = response.data;

        const modalHtml = `
            <h2>${pokemonData.name}</h2>
            <img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}">
            <p>Height: ${pokemonData.height}</p>
            <p>Weight: ${pokemonData.weight}</p>
            <p>Base Experience: ${pokemonData.base_experience}</p>
            <p>Abilities: ${pokemonData.abilities.map(ability => ability.ability.name).join(', ')}</p>
        `;
        modalContent.innerHTML = modalHtml;
        modal.style.display = 'flex';

        document.addEventListener('click', addCloseModalEventListener) 
    } catch (error) {
        console.error('Error fetching Pokémon details:', error);
    }
}


//Clicking outside modal closes it
function addCloseModalEventListener(event){
    const isClickInsideModal = modalContent.contains(event.target) || event.target === modalContent;
    if (!isClickInsideModal) {
        closeModal();
    }
    
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
    document.removeEventListener('click', addCloseModalEventListener);
}

// Initial fetch
checkCache();
