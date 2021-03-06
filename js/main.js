const moviesContainer = document.querySelector(".movies");
const input = document.querySelector("input");
const searchButton = document.querySelector(".searchIcon");
const checkboxInput = document.querySelector('input[type="checkbox"]');

checkboxInput.addEventListener("change", checkCheckboxStatus);
searchButton.addEventListener("click", searchMovie);
input.addEventListener("keyup", function (event) {
  console.log(event.key);
  if (event.keyCode == 13) {
    // Press enter (submit)
    searchMovie();
    return;
  }
});

function checkCheckboxStatus() {
  const isChecked = checkboxInput.checked;
  if (isChecked) {
    cleanAllMovies();
    const movies = getFavoriteMovies() || [];
    movies.forEach((movie) => renderMovie(movie));
  } else {
    cleanAllMovies();
    getAllPopularMovies();
  }
}

async function searchMovie() {
  const inputValue = input.value;
  if (inputValue != "") {
    cleanAllMovies();
    const movies = await searchMovieByName(inputValue);
    movies.forEach((movie) => renderMovie(movie));
  }
}

function cleanAllMovies() {
  moviesContainer.innerHTML = "";
}

async function searchMovieByName(title) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=0b315a483ddd1a98f546149981faecda&query=${title}&language=pt-BR&page=1`;
  const fetchResponse = await fetch(url);
  const { results } = await fetchResponse.json();
  return results;
}

async function getPopularMovies() {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=0b315a483ddd1a98f546149981faecda&language=pt-BR&page=1`;
  const fetchResponse = await fetch(url);
  const { results } = await fetchResponse.json();
  return results;
}

async function getStreaming(movie_id) {
  const url = `https://api.themoviedb.org/3/movie/${movie_id}/watch/providers?api_key=0b315a483ddd1a98f546149981faecda&watch_region=BR`;
  const fetchResponse = await fetch(url)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  return fetchResponse;
}

function favoriteButtonPressed(event, movie) {
  const favoriteState = {
    favorited: "images/heart-fill.svg",
    notFavorited: "images/heart.svg",
  };

  if (event.target.src.includes(favoriteState.notFavorited)) {
    // aqui ele ser?? favoritado
    event.target.src = favoriteState.favorited;
    saveToLocalStorage(movie);
  } else {
    // aqui ele ser?? desfavoritado
    event.target.src = favoriteState.notFavorited;
    removeFromLocalStorage(movie.id);
  }
}

function getFavoriteMovies() {
  return JSON.parse(localStorage.getItem("favoriteMovies"));
}

function saveToLocalStorage(movie) {
  const movies = getFavoriteMovies() || [];
  movies.push(movie);
  const moviesJSON = JSON.stringify(movies);
  localStorage.setItem("favoriteMovies", moviesJSON);
}

function checkMovieIsFavorited(id) {
  const movies = getFavoriteMovies() || [];
  return movies.find((movie) => movie.id == id);
}

function streamButtonPressed(name) {
  if (name == "HBO Max") {
    const url = "https://play.hbomax.com/";
    window.open(url);
  }
  if (name == "Netflix") {
    const url = "https://www.netflix.com/br/";
    window.open(url);
  }
  if (name == "Amazon Prime") {
    const url = "https://www.primevideo.com/";
    window.open(url);
  }
  if (name == "Disney Plus") {
    const url = "https://www.disneyplus.com/";
    window.open(url);
  }

  return;
}

function removeFromLocalStorage(id) {
  const movies = getFavoriteMovies() || [];
  const findMovie = movies.find((movie) => movie.id == id);
  const newMovies = movies.filter((movie) => movie.id != findMovie.id);
  localStorage.setItem("favoriteMovies", JSON.stringify(newMovies));
}

async function getAllPopularMovies() {
  const movies = await getPopularMovies();
  movies.forEach((movie) => renderMovie(movie));
}

window.onload = function () {
  getAllPopularMovies();
};

async function renderMovie(movie) {
  const { id, title, poster_path, vote_average, release_date, overview } =
    movie;

  const streaming = await getStreaming(id);
  const { results } = streaming;
  const { BR } = results;
  const { flatrate } = BR;
  const { provider_name, logo_path, display_priority } = flatrate[0];

  const isFavorited = checkMovieIsFavorited(id);

  const year = new Date(release_date).getFullYear();
  const image = `https://image.tmdb.org/t/p/w500${poster_path}`;

  const movieElement = document.createElement("div");
  movieElement.classList.add("movie");
  moviesContainer.appendChild(movieElement);

  const movieInformations = document.createElement("div");
  movieInformations.classList.add("movie-informations");

  const movieImageContainer = document.createElement("div");
  movieImageContainer.classList.add("movie-image");
  const movieImage = document.createElement("img");
  movieImage.src = image;
  movieImage.alt = `${title} Poster`;
  movieImageContainer.appendChild(movieImage);
  movieInformations.appendChild(movieImageContainer);

  const movieTextContainer = document.createElement("div");
  movieTextContainer.classList.add("movie-text");
  const movieTitle = document.createElement("h4");
  movieTitle.textContent = `${title} (${year})`;
  movieTextContainer.appendChild(movieTitle);
  movieInformations.appendChild(movieTextContainer);

  const informations = document.createElement("div");
  informations.classList.add("movie-informations");
  movieTextContainer.appendChild(informations);

  const ratingContainer = document.createElement("div");
  ratingContainer.classList.add("rating");
  const starImage = document.createElement("img");
  starImage.src = "images/star.png";
  starImage.alt = "Star";
  const movieRate = document.createElement("span");
  movieRate.classList.add("movie-rate");
  movieRate.textContent = vote_average;
  ratingContainer.appendChild(starImage);
  ratingContainer.appendChild(movieRate);
  informations.appendChild(ratingContainer);

  const favorite = document.createElement("div");
  favorite.classList.add("favorite");
  const favoriteImage = document.createElement("img");
  favoriteImage.src = isFavorited
    ? "images/heart-fill.svg"
    : "images/heart.svg";
  favoriteImage.alt = "Heart";
  favoriteImage.classList.add("favoriteImage");
  favoriteImage.addEventListener("click", (event) =>
    favoriteButtonPressed(event, movie)
  );
  const favoriteText = document.createElement("span");
  favoriteText.classList.add("movie-favorite");
  favoriteText.textContent = "Favoritar";
  favorite.appendChild(favoriteImage);
  favorite.appendChild(favoriteText);
  informations.appendChild(favorite);

  const stream = document.createElement("div");
  stream.classList.add("stream");
  const stremaName = document.createElement("span");
  const streamImage = document.createElement("img");
  streamImage.src = `https://image.tmdb.org/t/p/w500${logo_path}`;
  streamImage.classList.add("stream-image");
  streamImage.addEventListener("click", (event) =>
    streamButtonPressed(provider_name)
  );
  stremaName.textContent = provider_name;
  stream.appendChild(streamImage);
  stream.appendChild(stremaName);
  informations.appendChild(stream);

  const movieDescriptionContainer = document.createElement("div");
  movieDescriptionContainer.classList.add("movie-description");
  const movieDescription = document.createElement("span");
  movieDescription.textContent = overview;
  movieDescriptionContainer.appendChild(movieDescription);

  movieElement.appendChild(movieInformations);
  movieElement.appendChild(movieDescriptionContainer);
}
