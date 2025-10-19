// API Key y URLs base
const API_KEY = '88b2de2030df1b7ba2ccf085e8387aa2';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Variables globales
let currentPage = 1;
let currentFilters = {
    genre: '',
    year: '',
    sort: 'popularity.desc'
};

// Función para obtener películas populares
async function getPopularMovies(page = 1) {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=${page}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener películas:', error);
        return null;
    }
}

// Función para buscar películas
async function searchMovies(query, page = 1) {
    try {
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=${page}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al buscar películas:', error);
        return null;
    }
}

// Función para descubrir películas con filtros
async function discoverMovies(filters, page = 1) {
    try {
        let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&page=${page}`;
        
        if (filters.genre) {
            url += `&with_genres=${filters.genre}`;
        }
        if (filters.year) {
            url += `&primary_release_year=${filters.year}`;
        }
        if (filters.sort) {
            url += `&sort_by=${filters.sort}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al descubrir películas:', error);
        return null;
    }
}

// Función para obtener detalles de una película
async function getMovieDetails(movieId) {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=es-ES&append_to_response=credits,images`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener detalles:', error);
        return null;
    }
}

// Función para crear una tarjeta de película
function createMovieCard(movie) {
    const posterPath = movie.poster_path 
        ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=Sin+Imagen';
    
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'Desconocido';
    
    // Escapar comillas en el título para evitar problemas en el atributo alt
    const safeTitle = movie.title.replace(/"/g, '&quot;');
    
    return `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <div class="movie-card fade-in" onclick="goToMovieDetail(${movie.id})">
                <img src="${posterPath}" alt="${safeTitle}" />
                <div class="movie-card-body">
                    <div class="movie-title">${movie.title}</div>
                    <div class="mb-2">
                        <span class="movie-rating">⭐ ${rating}</span>
                        <span class="movie-date ms-2">${releaseYear}</span>
                    </div>
                    <div class="movie-overview">${movie.overview || 'Sin descripción disponible'}</div>
                </div>
            </div>
        </div>
    `;
}

// Función para mostrar las películas en el contenedor
function displayMovies(movies, append = false) {
    const container = document.getElementById('moviesContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    if (!append) {
        container.innerHTML = '';
    }
    
    if (movies && movies.length > 0) {
        movies.forEach(movie => {
            container.innerHTML += createMovieCard(movie);
        });
    } else {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No se encontraron películas</p>
            </div>
        `;
    }
}

// Función para navegar a la página de detalle
function goToMovieDetail(movieId) {
    // Guardamos el ID en localStorage para accederlo en detalle.html
    localStorage.setItem('selectedMovieId', movieId);
    window.location.href = 'detalle.html';
}



// Función para mostrar los detalles de la película
function displayMovieDetail(movie) {
    const loadingDetail = document.getElementById('loadingDetail');
    const movieDetail = document.getElementById('movieDetail');
    
    if (loadingDetail) loadingDetail.style.display = 'none';
    if (movieDetail) movieDetail.style.display = 'block';
    
    // Backdrop
    const backdrop = document.getElementById('movieBackdrop');
    if (backdrop && movie.backdrop_path) {
        backdrop.style.backgroundImage = `url(${IMAGE_BASE_URL}/original${movie.backdrop_path})`;
    }
    
    // Poster
    const poster = document.getElementById('moviePoster');
    if (poster) {
        poster.src = movie.poster_path 
            ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=Sin+Imagen';
        poster.alt = movie.title;
    }
    
    // Información básica
    document.getElementById('movieTitle').textContent = movie.title;
    document.getElementById('movieRating').textContent = `⭐ ${movie.vote_average.toFixed(1)}/10`;
    document.getElementById('movieYear').textContent = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    document.getElementById('movieRuntime').textContent = movie.runtime ? `${movie.runtime} min` : 'N/A';
    document.getElementById('movieOverview').textContent = movie.overview || 'Sin sinopsis disponible';
    
    // Géneros
    const genresContainer = document.getElementById('movieGenres');
    if (genresContainer && movie.genres) {
        genresContainer.innerHTML = movie.genres.map(genre => 
            `<span class="genre-badge">${genre.name}</span>`
        ).join('');
    }
    
    // Director (buscamos en el crew)
    const director = movie.credits && movie.credits.crew 
        ? movie.credits.crew.find(person => person.job === 'Director')
        : null;
    document.getElementById('movieDirector').textContent = director ? director.name : 'Desconocido';
    
    // Fecha de estreno
    document.getElementById('movieReleaseDate').textContent = movie.release_date 
        ? new Date(movie.release_date).toLocaleDateString('es-ES')
        : 'N/A';
    
    // Presupuesto y recaudación
    document.getElementById('movieBudget').textContent = movie.budget 
        ? `${(movie.budget / 1000000).toFixed(1)}M`
        : 'N/A';
    document.getElementById('movieRevenue').textContent = movie.revenue 
        ? `${(movie.revenue / 1000000).toFixed(1)}M`
        : 'N/A';
    
    // Reparto
    displayCast(movie.credits);
    
    // Galería
    displayGallery(movie.images);
    
    // Cargar reseñas guardadas
    loadReviews(movie.id);
}

// Función para mostrar el reparto
function displayCast(credits) {
    const castContainer = document.getElementById('castContainer');
    
    if (!credits || !credits.cast || credits.cast.length === 0) {
        castContainer.innerHTML = '<p class="text-muted">No hay información del reparto</p>';
        return;
    }
    
    // Mostramos los primeros 8 actores
    const mainCast = credits.cast.slice(0, 8);
    
    castContainer.innerHTML = mainCast.map(actor => `
        <div class="col-6 col-sm-4 col-md-3 col-lg-2">
            <div class="cast-card">
                <img src="${actor.profile_path ? IMAGE_BASE_URL + '/w185' + actor.profile_path : 'https://via.placeholder.com/185x278?text=Sin+Foto'}" 
                     alt="${actor.name}" />
                <div class="cast-name">${actor.name}</div>
                <div class="cast-character">${actor.character}</div>
            </div>
        </div>
    `).join('');
}

// Función para mostrar la galería de imágenes
function displayGallery(images) {
    const galleryContainer = document.getElementById('galleryContainer');
    
    if (!images || !images.backdrops || images.backdrops.length === 0) {
        galleryContainer.innerHTML = '<p class="text-muted">No hay imágenes disponibles</p>';
        return;
    }
    
    // Mostramos las primeras 6 imágenes
    const mainImages = images.backdrops.slice(0, 6);
    
    galleryContainer.innerHTML = mainImages.map(image => `
        <div class="col-6 col-sm-4 col-md-3">
            <div class="gallery-item">
                <img src="${IMAGE_BASE_URL}/w500${image.file_path}" 
                     alt="Imagen de la película" />
            </div>
        </div>
    `).join('');
}

// Función para guardar una reseña
function saveReview(movieId, review) {
    // Obtenemos las reseñas existentes del localStorage
    let reviews = JSON.parse(localStorage.getItem('movieReviews')) || {};
    
    // Si no existen reseñas, creamos un array
    if (!reviews[movieId]) {
        reviews[movieId] = [];
    }
    
    // Agregar Nueva reseña
    reviews[movieId].push({
        ...review,
        date: new Date().toISOString()
    });
    
    // Guardamos en localStorage
    localStorage.setItem('movieReviews', JSON.stringify(reviews));
}

// Función para cargar las reseñas de una película
function loadReviews(movieId) {
    const reviewsContainer = document.getElementById('reviewsContainer');
    const reviews = JSON.parse(localStorage.getItem('movieReviews')) || {};
    const movieReviews = reviews[movieId] || [];
    
    if (movieReviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="alert alert-info">
                Aún no hay reseñas para esta película. ¡Sé el primero en opinar!
            </div>
        `;
        return;
    }
    
    reviewsContainer.innerHTML = movieReviews.map(review => {
        const stars = '⭐'.repeat(review.rating);
        const date = new Date(review.date).toLocaleDateString('es-ES');
        
        return `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-author">${review.name}</span>
                    <span class="review-rating">${stars}</span>
                </div>
                <p class="review-text">${review.text}</p>
                <small class="review-date">Publicado el ${date}</small>
            </div>
        `;
    }).join('');
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Verificar si estamos en la página principal (index.html)
    if (document.getElementById('moviesContainer')) {
        initIndexPage();
    }
    
    // Verificar si estamos en la página de detalle (detalle.html)
    if (document.getElementById('movieDetail')) {
        initDetailPage();
    }
});

// Inicializar la página principal
function initIndexPage() {
    // Cargar películas populares al inicio
    loadMovies();
    
    // Botón de búsqueda
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Filtros
    const genreFilter = document.getElementById('genreFilter');
    const yearFilter = document.getElementById('yearFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (genreFilter) {
        genreFilter.addEventListener('change', function() {
            currentFilters.genre = this.value;
            currentPage = 1;
            loadMoviesWithFilters();
        });
    }
    
    if (yearFilter) {
        yearFilter.addEventListener('change', function() {
            currentFilters.year = this.value;
            currentPage = 1;
            loadMoviesWithFilters();
        });
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            currentFilters.sort = this.value;
            currentPage = 1;
            loadMoviesWithFilters();
        });
    }
    
    // Botón "Cargar más"
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            currentPage++;
            loadMovies(true);
        });
    }
}

// Función para cargar películas
async function loadMovies(append = false) {
    const data = await getPopularMovies(currentPage);
    if (data && data.results) {
        displayMovies(data.results, append);
    }
}

// Función para cargar películas con filtros
async function loadMoviesWithFilters(append = false) {
    const data = await discoverMovies(currentFilters, currentPage);
    if (data && data.results) {
        displayMovies(data.results, append);
    }
}

// Función para realizar búsqueda
async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query === '') {
        // Si el campo está vacío, cargar películas populares
        currentPage = 1;
        loadMovies();
        return;
    }
    
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    
    const data = await searchMovies(query);
    if (data && data.results) {
        displayMovies(data.results);
    }
}

// Inicializar la página de detalle
async function initDetailPage() {
    // Obtener el ID de la película del localStorage
    const movieId = localStorage.getItem('selectedMovieId');
    
    if (!movieId) {
        alert('No se seleccionó ninguna película');
        window.location.href = 'index.html';
        return;
    }
    
    // Cargar los detalles de la película
    const movie = await getMovieDetails(movieId);
    if (movie) {
        displayMovieDetail(movie);
    } else {
        alert('Error al cargar los detalles de la película');
        window.location.href = 'index.html';
    }
    
    // Formulario de reseña
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('reviewerName').value;
            const rating = document.getElementById('reviewRating').value;
            const text = document.getElementById('reviewText').value;
            
            if (name && rating && text) {
                const review = {
                    name: name,
                    rating: parseInt(rating),
                    text: text
                };
                
                saveReview(movieId, review);
                loadReviews(movieId);
                
                // Limpiar el formulario
                reviewForm.reset();
                
                // Mostrar mensaje de éxito
                alert('¡Reseña publicada exitosamente!');
            }
        });
    }
}