//Config--------------

const apiUrl = window.POKEMON_API_URL;

//Components------------

const pokemonContainer = document.getElementById('pokemonContainer');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const searchBox = document.getElementById('search');
const paginationContainer = document.getElementById('paginationContainer');

//Variables------------

let pokemonList = [];

//Event listeners--------

//For listening for typing
searchBox.addEventListener('input', handleSearch);

//Methods-------

//Check to see if data is in cache, if not call api
function checkCache() {
    pokemonList = JSON.parse(localStorage.getItem('pokemonData'));
    if(!pokemonList){
        fetchPokemon()
    } else {
        displayPokemon(pokemonList)
    }
}

// Fetching pokemon from API
async function fetchPokemon(){
     await axios.get(`${apiUrl}?limit=151`).then((resp) => {
        pokemonList = resp.data.results;

        //Setting local storage
        localStorage.setItem('pokemonData', JSON.stringify(pokemonList));

        //Displaying pokemon
        displayPokemon(pokemonList);
    }).catch((err) => {
        console.error('Error fetching Pokémon:', err);
    }); 
}

// Display Pokémon on the page using CSS Grid
function displayPokemon(displayPokemonList, page = 1, itemsPerPage = 20) {
    pokemonContainer.innerHTML = '';

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedPokemon = displayPokemonList.slice(startIndex, endIndex);

    displayedPokemon.forEach(pokemon => {
        const capitalizedPokemonName = capitalizeFirstLetter(pokemon.name);
        const pokemonImageUrl = getPokemonImageUrl(pokemon.url);

        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');
        pokemonCard.innerHTML = `
            <h3>${capitalizedPokemonName}</h3>
            <img src="${pokemonImageUrl}" alt="${capitalizedPokemonName}">
        `;
        pokemonCard.addEventListener('click', () => openModal(pokemon.name));

        pokemonContainer.appendChild(pokemonCard);
    });
    if(displayPokemonList.length > itemsPerPage){
        addPaginationButtons(page, Math.ceil(displayPokemonList.length / itemsPerPage));
    }
}

// Get Pokémon image URL
function getPokemonImageUrl(apiUrl) {
    const pokemonId = apiUrl.split('/').slice(-2, -1)[0];
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

// Add pagination buttons
function addPaginationButtons(currentPage, totalPages) {
    paginationContainer.innerHTML = '';

    const previousButton = createPaginationButton('Previous', currentPage - 1, totalPages);
    const nextButton = createPaginationButton('Next', currentPage + 1, totalPages);

    paginationContainer.appendChild(previousButton);
    paginationContainer.appendChild(nextButton);
}

function createPaginationButton(label, page, totalPages) {
    const button = document.createElement('button');
    button.textContent = label;
    button.addEventListener('click', () => {
        if (page >= 1 && page <= totalPages) {
            handleSearch(page);
        }
    });
    return button;
}

// Search functionality
function handleSearch(page = 1) {
    let searchInput = searchBox.value.toLowerCase();
    if(searchInput && searchInput.length > 0){
        let filteredPokemonList = pokemonList.filter(pokemon => pokemon.name.includes(searchInput.toLowerCase()));
        displayPokemon(filteredPokemonList, page); 
    } else {
        displayPokemon(pokemonList, page);
    }
    
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

//Helpers------

// Close modal
function closeModal() {
    modal.style.display = 'none';
    document.removeEventListener('click', addCloseModalEventListener);
}

// Capitalize
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initial fetch
checkCache();
