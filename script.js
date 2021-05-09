const url = 'https://my-json-server.typicode.com/moviedb-tech/movies/list/';
const active = 'active';
const listView = 'list';
const cardView = 'card';
const cardBlockView = document.querySelector('.card-view');
const listBlockView = document.querySelector('.list-view');
const favoriteList = document.querySelector('.fav-list');
const detailsModal = document.querySelector('.details-modal');
const viewBlock = document.querySelector('.view-block');
const select = document.querySelector('#genres-select');

init()

function init() {
    fetch(url)
        .then(response => response.json())
        .then((result) => {
            renderMoviesBlock(result)
            renderFavoriteMovies(result);
            getGenres(result)
            selectGenre(result)
            toggleViewMode(result)
        })

    let view = localStorage.getItem('view');
    if (view === listView) {
        listBlockView.style.display = 'flex'
        cardBlockView.style.display = 'none'
        document.querySelector('.fa-th').classList.remove(active);
        document.querySelector('.fa-th-list').classList.add(active);
    } else {
        listBlockView.style.display = 'none'
        cardBlockView.style.display = 'flex'
        document.querySelector('.fa-th').classList.add(active);
        document.querySelector('.fa-th-list').classList.remove(active);
    }
}

function renderMoviesBlock(list) {
    let cardFragment = document.createDocumentFragment();
    let listFragment = document.createDocumentFragment();
    for (let elem of list) {
        let cardItem = document.createElement('div');
        let listItem = document.createElement('div');
        cardItem.className = "card-item";
        listItem.className = "list-item";
        cardItem.setAttribute('data-target', `${elem.id}`);
        listItem.setAttribute('data-target', `${elem.id}`);
        cardItem.innerHTML = `<img src="${elem.img}" class="img" alt="${elem.name}">
                        <button type="button" class="add-favorite" data-id="${elem.id}"><i class="fa fa-star"></i></button>
                        <div class="card-text">
                            <h3 class="name">${elem.name}</h3>
                            <p class="year">${elem.year}</p>
                        </div>`
                        
        listItem.innerHTML = `<img src="${elem.img}" class="img list" alt="${elem.name}">
                        <button type="button" class="add-favorite-list" data-id="${elem.id}"><i class="fa fa-star"></i></button>
                        <div class="list-text">
                            <div class="list-title">
                                <h3 class="list-name">${elem.name}</h3>
                                <p>${elem.year}</p>
                            </div>
                            <p class="description-list">${elem.description}></p>
                        </div>`
        let genresBlock = document.createElement('div');
        genresBlock.classList.add('genres-block-list');
        for (let genre of elem.genres) {
            let item = document.createElement('div');
            item.innerText = genre;
            genresBlock.append(item)
        }
        listItem.querySelector('.description-list').after(genresBlock);
        cardFragment.append(cardItem);
        listFragment.append(listItem);
        addItemsEvent(cardItem, elem);
        addItemsEvent(listItem, elem);
    }
    cardBlockView.append(cardFragment);
    listBlockView.append(listFragment);
    setActiveFavoriteIcons();
}

function addItemsEvent(item, elem) {
    item.addEventListener('click', function(e) {
        if (e.target.classList.contains('fa-star')) {
            favoriteBtnHandle(e, elem);
        } else {
            detailsModal.style.display = 'block';
            let details = document.querySelector('.detail-block');
            details?.remove()
            getMovieDetails(elem.id)
        }
    })
}

function favoriteBtnHandle(e, elem) {
    let iconButtons = [...document.querySelectorAll('[data-id]')];
    if (e.target.classList.contains(active)) {
        e.target.classList.remove(active);
        removeFavoriteMovie(elem);
        let favoriteList = document.querySelectorAll('.fav-list>div');
        for (let removingMovie of favoriteList) {
            if (removingMovie.innerText === elem.name) {
                removingMovie.remove()
            }
        }
        for (let icon of iconButtons) {
            if (icon.dataset.id == e.target.parentElement.dataset.id) {
                icon.childNodes[0].classList.remove(active)
            }
        }
    } else {
        e.target.classList.add(active);
        addFavoriteMovie(elem);
        addMovieToFavoriteList(elem);
        for (let icon of iconButtons) {
            if (icon.dataset.id == e.target.parentElement.dataset.id) {
                icon.childNodes[0].classList.add(active)
            }
        }
    }
}

function getMovieDetails(id) {
    fetch(url + id)
        .then(response => response.json())
        .then(result => renderMovieDetails(result))
}

function renderMovieDetails(info) {
    let modalMedia = document.querySelector('.modal-media');
    let modalText = document.querySelector('.modal-text');
    modalMedia.innerHTML = `<img src="${info.img}" class="modal-img" alt="${info.name}">
                            <div class="modal-fav-year">
                                <button type="button" class="add-favorite" data-id="${info.id}"><i class="fa fa-star"></i></button>
                                <p class="year">${info.year} year</p>
                            </div>`
    modalText.innerHTML = `<h3 class="movie-name">${info.name}</h3>
                            <div class="description">
                                <p>${info.description}</p>
                            </div> 
                            <div class="team">
                                <p>Director: ${info.director}</p>
                                <p>Starring: ${info.starring.join(', ')} </p>
                            </div>`
    let genresBlock = document.createElement('div');
    genresBlock.className = 'genres-block';
    for (let genre of info.genres) {
        let item = document.createElement('div');
        item.innerText = genre;
        item.className = 'genres-block-item';
        genresBlock.append(item)
    }
    modalMedia.append(genresBlock)
    setActiveFavoriteIcons()
    modalMedia.querySelector('.add-favorite').addEventListener('click', (e) => {
        favoriteBtnHandle(e, info);
    })
}

function addFavoriteMovie(value) {
    let favoriteArray = JSON.parse(localStorage.getItem('favorites')) || [];
    favoriteArray.push(value.id)
    localStorage.setItem('favorites', JSON.stringify(favoriteArray))
}

function removeFavoriteMovie(value) {
    let storageArray = JSON.parse(localStorage.getItem('favorites')).filter(item => item !== value.id);
    localStorage.setItem('favorites', JSON.stringify(storageArray));
}

function setActiveFavoriteIcons() {
    let storageArray = JSON.parse(localStorage.getItem('favorites'));
    if (storageArray) {
        let iconButtons = [...document.querySelectorAll('[data-id]')];
        let idValuesArray = iconButtons.map(el => +el.getAttribute('data-id'))
        let activeIcons = idValuesArray.filter(el => idValuesArray[storageArray.indexOf(el)])
        for (let icon of iconButtons) {
            for (let i = 0; i < activeIcons.length; i++) {
                if (icon.dataset.id == activeIcons[i]) {
                    icon.childNodes[0].classList.add(active)
                }
            }
        }
    }
}

function renderFavoriteMovies(list) {
    let favoriteArray = JSON.parse(localStorage.getItem('favorites'));
    if (favoriteArray) {
        let moviesNames = list.filter((el) => {
            for (let i = 0; i < favoriteArray.length; i++) {
                if (el.id == favoriteArray[i]) {
                    return el
                }
            }
        })
        for (let movie of moviesNames) {
            addMovieToFavoriteList(movie)
        }
    }
}

function addMovieToFavoriteList(movie) {
    let item = document.createElement('div');
    item.innerHTML = `<div class="favlist-title">
                        <i class="fa fa-arrow-right"></i>
                        <p class="fav-name">${movie.name}</p>
                     </div>
                     <i class="fa fa-trash"></i>`
    favoriteList.append(item)
    item.querySelector('.fa-trash').addEventListener('click', function() {
        removeFavoriteMovie(movie);
        this.parentElement.remove();
        let iconButtons = [...document.querySelectorAll('[data-id]')];
        for (let icon of iconButtons) {
            if (icon.dataset.id == movie.id) {
                icon.childNodes[0].classList.remove(active)
            }
        }
    })
    item.querySelector('.fav-name').addEventListener('click', () => {
        detailsModal.style.display = 'block';
        let details = document.querySelector('.detail-block');
        details?.remove()
        getMovieDetails(movie.id)
    })
}

function getGenres(list) {
    const modifiedMovies = list.map(el => modifyMovies(el))
    const allGenres = new Set(modifiedMovies.flatMap(el => el.genres));
    let fragment = document.createDocumentFragment();
    for (let genre of allGenres) {
        let option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        fragment.append(option);
    }
    select.append(fragment);
}

function selectGenre(movies) {
    document.querySelector('.select-form').addEventListener('change', function() {
        genresFilter(movies, select.value)
        setActiveFavoriteIcons()
    })
}

function genresFilter(movies, value) {
    let targetMoviesId;
    let items;
    let selectedItems;
    let viewState = localStorage.getItem('view');
    const modifiedMovies = movies.map(el => modifyMovies(el))
    const targetMovies = modifiedMovies.filter(el => el.genres.includes(value));
    targetMoviesId = targetMovies.map(el => el.id);
    if (viewState === listView) {
        listBlockView.style.display = 'flex';
        cardBlockView.style.display = 'none';
        items = [...document.querySelectorAll('.list-item')];
        for (let item of items) {
            item.classList.add('hidden');
        }
    } else {
        cardBlockView.style.display = 'flex';
        listBlockView.style.display = 'none';
        items = [...document.querySelectorAll('.card-item')];
        for (let item of items) {
            item.classList.add('hidden');
        }
    }
    if (value === "all" || value === "default") {
        targetMoviesId = movies.map(el => el.id)
    }
    selectedItems = items.filter((el) => {
        for (let i = 0; i < targetMoviesId.length; i++) {
            if (+el.dataset.target == targetMoviesId[i]) {
                return el
            }
        }
    })
    for (let item of selectedItems) {
        item.classList.remove('hidden');
    }
}

function modifyMovies(info) {
    const movie = {
        ...info,
    };
    movie.genres = info.genres.map(el => el.toLowerCase())
    return movie;
}

function toggleViewMode(list) {
    viewBlock.addEventListener('click', function(e) {
        if (e.target.classList.contains('fa-th')) {
            e.target.classList.add(active);
            e.target.nextElementSibling.classList.remove(active);
            cardBlockView.style.display = 'flex';
            listBlockView.style.display = 'none';
            localStorage.setItem('view', cardView);
        } else if (e.target.classList.contains('fa-th-list')) {
            e.target.classList.add(active);
            e.target.previousElementSibling.classList.remove(active);
            listBlockView.style.display = 'flex';
            cardBlockView.style.display = 'none';
            localStorage.setItem('view', listView);
        }
        genresFilter(list, select.value)
    })
}

document.querySelector('.close-btn').addEventListener('click', () => {
    detailsModal.style.display = 'none';
})