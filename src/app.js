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
//Available filters
let types = [];
let colors = [];
//Chosen filters
let selectedType = '';
let selectedColor = '';
let searchInput = '';

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
    if(!pokemonList || !types || !colors){
        fetchPokemon()
    } else {
        displayPokemon(pokemonList);
        // Populate dropdowns
        populateDropdown('typeDropdown', types);
        populateDropdown('colorDropdown', colors);
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
        // Fetch colors
        const colorsResponse = await axios.get(`${apiUrl}/pokemon-color`);
        colors = colorsResponse.data.results;
        localStorage.setItem('pokemonColors', JSON.stringify(colors));

        // Populate dropdowns
        populateDropdown('typeDropdown', types);
        populateDropdown('colorDropdown', colors);
        addListenerToDropdowns();
    } catch (err) {
        console.error('Error fetching filters:', err);
    }
}


// Fetch Pokémon based on filters and search
async function fetchFilteredPokemon(page) {
    try {
      
        // Fetch Pokémon for each filter
        const typeFilter = selectedType ? fetchFilterData('type', selectedType) : pokemonList;
        const colorFilter = selectedColor ? fetchFilterData('pokemon-color', selectedColor) : pokemonList;
        
        // Wait for all filter requests to complete
        const [typeResults, colorResults] = await Promise.all([
            typeFilter,
            colorFilter,
        ]);
    
  
      // Find the intersection of results
      const filteredPokemonList = findIntersection(typeResults, colorResults);
      // Apply search filter
      const searchedPokemonList = (searchInput && searchInput.length > 0) ? filteredPokemonList.filter(pokemon => pokemon.name.includes(searchInput.toLowerCase())) : filteredPokemonList;
  
      // Compare with the original pokemonList
      const finalFilteredPokemonList = findIntersection(pokemonList, searchedPokemonList);
  
      // Display filtered Pokémon
      displayPokemon(finalFilteredPokemonList, page);
    } catch (error) {
      console.error('Error fetching filtered Pokémon:', error);
    }
}
  
// Fetch filter data
async function fetchFilterData(filterType, filterValue) {
    const url = `${apiUrl}/${filterType}/${filterValue}?limit=151`;
    const response = await axios.get(url);
    if(filterType === 'pokemon-color'){
        return response.data.pokemon_species;
    }
    return response.data.pokemon.map(item => item.pokemon);
}
  
// Find the intersection of arrays
function findIntersection(...arrays) {
    return arrays.reduce((accumulator, currentArray) =>
      accumulator.filter(value =>
        currentArray.some(item => item.name === value.name)
      )
    );
  }

// Handle dropdown and search changes
function handleTypeChange(event) {
    selectedType = event.target.value;
    fetchFilteredPokemon();
}
  
function handleColorChange(event) {
    selectedColor = event.target.value;
    fetchFilteredPokemon();
}
  
function handleSearch() {
    searchInput = searchBox.value.toLowerCase();
    fetchFilteredPokemon();
}


// Display Pokémon on the page using grid for responsivity
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
            fetchFilteredPokemon(page);
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
function handleSearchWithDelay() {
    clearTimeout(searchDelayTimer);
    searchDelayTimer = setTimeout(() => {
        handleSearch();
    }, 300);
}

function addListenerToDropdowns(){
    const typeDropdown = document.getElementById('typeDropdown');
    const colorDropdown = document.getElementById('colorDropdown');

    typeDropdown.addEventListener('change', handleTypeChange);
    colorDropdown.addEventListener('change', handleColorChange);
}

// Initial fetch
checkCache();
