//Config--------------

const apiUrl = window.POKEMON_API_URL;

//Components------------

const pokemonContainer = document.getElementById('pokemonContainer');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const searchBox = document.getElementById('search');
const paginationContainer = document.getElementById('paginationContainer');

//Variables------------

//Pokemon and associated data
let pokemonList = [];
let types = [];
let colors = [];
let regions = [];

//Search delay
let searchDelayTimer;
//Pagination
let currentPage = 1;
let totalPages = 1;

//Methods-------

//Check to see if data is in cache, if not call api
function checkCache() {
    pokemonList = JSON.parse(localStorage.getItem('pokemonData'));
    types = JSON.parse(localStorage.getItem('pokemonTypes'));
    colors = JSON.parse(localStorage.getItem('pokemonColors'));
    regions = JSON.parse(localStorage.getItem('pokemonRegions'));
    if(!pokemonList || !types || !regions || !colors){
        fetchPokemon()
    } else {
        displayPokemon(pokemonList);
        // Populate dropdowns
        populateDropdown('typeDropdown', types);
        populateDropdown('colorDropdown', colors);
        populateDropdown('regionDropdown', regions);
        addListenerToDropdowns();
    }
    searchBox.value = '';
}

// Fetching pokemon from API
async function fetchPokemon(){
     await axios.get(`${apiUrl}/pokemon?limit=151`).then((resp) => {
        pokemonList = resp.data.results;
        pokemonList.forEach((pokemon) => {
            pokemon.image = getPokemonImageUrl(pokemon.url);
        });
        //Setting local storage
        localStorage.setItem('pokemonData', JSON.stringify(pokemonList));
        //Getting filters
        fetchFilters()
        //Displaying pokemon
        displayPokemon(pokemonList);
    }).catch((err) => {
        console.error('Error fetching Pokémon:', err);
    });
}

// Fetching filters
async function fetchFilters(){
    try {
        // Fetch types
        const typesResponse = await axios.get(`${apiUrl}/type`);
        types = typesResponse.data.results;
        localStorage.setItem('pokemonTypes', JSON.stringify(types));
        console.log('hi')
        // Fetch colors
        const colorsResponse = await axios.get(`${apiUrl}/pokemon-color`);
        colors = colorsResponse.data.results;
        localStorage.setItem('pokemonColors', JSON.stringify(colors));

        // Fetch regions
        const regionsResponse = await axios.get(`${apiUrl}/region`);
        regions = regionsResponse.data.results;
        localStorage.setItem('pokemonRegions', JSON.stringify(regions));

        // Populate dropdowns
        populateDropdown('typeDropdown', types);
        populateDropdown('colorDropdown', colors);
        populateDropdown('regionDropdown', regions);
        addListenerToDropdowns();
    } catch (err) {
        console.error('Error fetching filters:', err);
    }
}


function handleDropdownChange(event) {
    const selectedValue = event.target.value;
    const dropdownId = event.target.id;

    /* const apiEndpoint = apiEndpoints[dropdownId];

    const apiUrl = `${apiEndpoint}${selectedValue}/`; */
  }


// Display Pokémon on the page using CSS Grid
function displayPokemon(displayPokemonList, page = 1, itemsPerPage = 20) {
    pokemonContainer.innerHTML = '';

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedPokemon = displayPokemonList.slice(startIndex, endIndex);
    displayedPokemon.forEach(pokemon => {
        const capitalizedPokemonName = capitalizeFirstLetter(pokemon.name);
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('pokemon-card');
        pokemonCard.innerHTML = `
            <h3>${capitalizedPokemonName}</h3>
            <img src="${pokemon.image}" alt="${capitalizedPokemonName}">
        `;
        pokemonCard.addEventListener('click', () => openModal(pokemon.name));

        pokemonContainer.appendChild(pokemonCard);
    });

    //Clearing buttons if not enough results
    paginationContainer.innerHTML = '';
    if(displayPokemonList.length > itemsPerPage){
        totalPages = Math.ceil(displayPokemonList.length / itemsPerPage);
        addPaginationButtons(page);
    } 
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

// Add pagination buttons
function addPaginationButtons(currentPage) {
    const previousButton = createPaginationButton('Previous', currentPage - 1);
    const nextButton = createPaginationButton('Next', currentPage + 1);
    const pageLabel = document.createElement('span');
    pageLabel.textContent = `Page ${currentPage} of ${totalPages}`;

    paginationContainer.appendChild(previousButton);
    paginationContainer.appendChild(pageLabel);
    paginationContainer.appendChild(nextButton);
}

function createPaginationButton(label, page) {
    const button = document.createElement('button');
    button.textContent = label;
    button.addEventListener('click', () => {
        if (page >= 1 && page <= totalPages) {
            handleSearchWithDelay(page);
        }
    });
    return button;
}

// Populate dropdown options
function populateDropdown(dropdownId, options) {
    const dropdown = document.getElementById(dropdownId);

    dropdown.innerHTML = '<option value="">All</option>';

    options.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.value = option.name;
        optionElement.text = option.name;
        dropdown.appendChild(optionElement);
    });
}


// Open Modal and fetch more data
async function openModal(pokemonName) {
    try {
        const response = await axios.get(`${apiUrl}/pokemon/${pokemonName}`);
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


//Helpers------

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

// Capitalize
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Get Pokémon image URL
function getPokemonImageUrl(url) {
    const pokemonId = url.split('/').slice(-2, -1)[0];
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

// Search delay
function handleSearchWithDelay(page = 1) {
    clearTimeout(searchDelayTimer);
    searchDelayTimer = setTimeout(() => {
        handleSearch(page);
    }, 300);
}

function addListenerToDropdowns(){
    const typeDropdown = document.getElementById('typeDropdown');
    const colorDropdown = document.getElementById('colorDropdown');
    const regionDropdown = document.getElementById('regionDropdown');

    typeDropdown.addEventListener('change', handleTypeChange);
    colorDropdown.addEventListener('change', handleColorChange);
    regionDropdown.addEventListener('change', handleRegionChange);
}

// Initial fetch
checkCache();
