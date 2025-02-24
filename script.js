// DOM Elements
const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');

// API Key
const OMDB_API_KEY = 'fc1fef96';

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Load movies from API
async function loadMovies(searchTerm) {
    try {
        const URL = `https://omdbapi.com/?s=${searchTerm}&page=1&apikey=${OMDB_API_KEY}`;
        const response = await fetch(URL);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        if (data.Response === "True") {
            displayMovieList(data.Search);
        } else {
            searchList.innerHTML = '<div class="search-list-item">No results found</div>';
        }
        
        showSearchList();
    } catch (error) {
        console.error('Error fetching movies:', error);
        searchList.innerHTML = '<div class="search-list-item">Error loading results</div>';
        showSearchList();
    }
}

// Display functions
function showSearchList() {
    searchList.classList.add('show-search-list');
}

function hideSearchList() {
    searchList.classList.remove('show-search-list');
}

// Display movie list
function displayMovieList(movies) {
    searchList.innerHTML = movies.map(movie => `
        <div class="search-list-item" data-id="${movie.imdbID}">
            <div class="search-item-thumbnail">
                <img src="${movie.Poster !== "N/A" ? movie.Poster : "image_not_found.png"}" 
                     alt="${movie.Title}" loading="lazy">
            </div>
            <div class="search-item-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
            </div>
        </div>
    `).join('');
    
    // Add click events to search results
    attachMovieClickEvents();
}

// Attach click events to movie items
function attachMovieClickEvents() {
    const searchListMovies = searchList.querySelectorAll('.search-list-item');
    searchListMovies.forEach(movie => {
        movie.addEventListener('click', async () => {
            hideSearchList();
            movieSearchBox.value = "";
            await loadMovieDetails(movie.dataset.id);
        });
    });
}

// Load movie details
async function loadMovieDetails(movieId) {
    try {
        const URL = `http://www.omdbapi.com/?i=${movieId}&apikey=${OMDB_API_KEY}`;
        const response = await fetch(URL);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const movie = await response.json();
        displayMovieDetails(movie);
    } catch (error) {
        console.error('Error fetching movie details:', error);
        resultGrid.innerHTML = '<div class="error">Error loading movie details</div>';
    }
}

// Display movie details
function displayMovieDetails(movie) {
    resultGrid.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.Poster !== "N/A" ? movie.Poster : "image_not_found.png"}" 
                 alt="${movie.Title}" loading="lazy">
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <ul class="movie-misc-info">
                <li class="year">Year: ${movie.Year}</li>
                <li class="rated">Ratings: ${movie.Rated}</li>
                <li class="released">Released: ${movie.Released}</li>
            </ul>
            <p class="genre"><b>Genre:</b> ${movie.Genre}</p>
            <p class="writer"><b>Writer:</b> ${movie.Writer}</p>
            <p class="actors"><b>Actors:</b> ${movie.Actors}</p>
            <p class="plot"><b>Plot:</b> ${movie.Plot}</p>
            <p class="language"><b>Language:</b> ${movie.Language}</p>
            <p class="awards"><b><i class="fas fa-award"></i></b> ${movie.Awards}</p>
        </div>
    `;
}

// Event listeners
movieSearchBox.addEventListener('input', debounce(() => {
    const searchTerm = movieSearchBox.value.trim();
    if (searchTerm.length > 0) {
        loadMovies(searchTerm);
    } else {
        hideSearchList();
    }
}, 300));

// Close search list when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-element')) {
        hideSearchList();
    }
});