// Список радиостанций — указывай здесь реальные пути к картинкам.
// Пример: "images/pm1.jpg" или полный URL "https://example.com/pm1.jpg"
const radioStations = [
    {
        id: 1,
        name: "Тает лёд",
        frequency: "Название альбома",
        url: "https://ff0cedb467804e3abec16d2aed7b40d5.bckt.ru/Griby_-_Taet_Ljod.mp3",
        img: "Фото/pm1.jpeg",
        favorite: false
    },
    {
        id: 2,
        name: "In the end",
        frequency: "Название альбома",
        url: "https://ff0cedb467804e3abec16d2aed7b40d5.bckt.ru/Linkin_Park_-_In_The_End.mp3",
        img: "Фото/pm2.jpeg",
        favorite: false
    },
    {
        id: 3,
        name: "Numb",
        frequency: "Название альбома",
        url: "https://ff0cedb467804e3abec16d2aed7b40d5.bckt.ru/Linkin_Park_-_Numb.mp3",
        img: "Фото/pm3.jpeg",
        favorite: false
    }
];

// Встроенная SVG-заглушка (будет использована, если картинка не загрузилась)
const svgPlaceholder = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="100%" height="100%" fill="#ddd"/>
        <text x="50%" y="50%" font-size="14" text-anchor="middle" fill="#666" dy=".3em">No image</text>
    </svg>`
);

// Текущее состояние
let currentStationIndex = 0;
let isPlaying = false;
let showOnlyFavorites = false;

// DOM-элементы (будут найдены при инициализации)
let audioPlayer;
let currentStationElement;
let currentFrequencyElement;
let playBtn;
let playIcon;
let playText;
let prevBtn;
let nextBtn;
let volumeSlider;
let stationsContainer;
let favoritesFilterBtn;

function initRadio() {
    // Найдём элементы в DOM
    audioPlayer = document.getElementById('radio-player');
    currentStationElement = document.getElementById('current-station');
    currentFrequencyElement = document.getElementById('current-frequency');
    playBtn = document.getElementById('play-btn');
    playIcon = document.getElementById('play-icon');
    playText = document.getElementById('play-text');
    prevBtn = document.getElementById('prev-btn');
    nextBtn = document.getElementById('next-btn');
    volumeSlider = document.getElementById('volume-slider');
    stationsContainer = document.getElementById('stations-container');
    favoritesFilterBtn = document.getElementById('favorites-filter-btn');

    if (!stationsContainer) {
        console.error('stations-container не найден в DOM. Проверьте id в HTML.');
        return;
    }

    // Загружаем избранные треки из localStorage
    loadFavoritesFromStorage();
    loadStationsList();
    setStation(currentStationIndex);

    if (audioPlayer && volumeSlider) {
        audioPlayer.volume = volumeSlider.value / 100;
    }

    setupEventListeners();
}

// ФУНКЦИИ ДЛЯ РАБОТЫ С ИЗБРАННЫМ
function toggleFavorite(stationId) {
    const stationIndex = radioStations.findIndex(station => station.id === stationId);
    if (stationIndex !== -1) {
        radioStations[stationIndex].favorite = !radioStations[stationIndex].favorite;
        saveFavoritesToStorage();
        updateFavoriteButton(stationId);
        return radioStations[stationIndex].favorite;
    }
    return false;
}

function saveFavoritesToStorage() {
    const favorites = radioStations
        .filter(station => station.favorite)
        .map(station => station.id);
    localStorage.setItem('radioFavorites', JSON.stringify(favorites));
}

function loadFavoritesFromStorage() {
    const favorites = JSON.parse(localStorage.getItem('radioFavorites') || '[]');
    radioStations.forEach(station => {
        station.favorite = favorites.includes(station.id);
    });
}

function updateFavoriteButton(stationId) {
    const favoriteBtn = document.querySelector(`.favorite-btn[data-id="${stationId}"]`);
    if (favoriteBtn) {
        const station = radioStations.find(s => s.id === stationId);
        if (station) {
            // Находим изображение внутри vbutton
            const favoriteImg = favoriteBtn.querySelector('img.favorite-icon');
            if (favoriteImg) {
                favoriteImg.src = station.favorite ? "Фото/like1.png" : "Фото/like2.png";
                favoriteImg.alt = station.favorite ? "В избранном" : "Добавить в избранное";
            }
            favoriteBtn.title = station.favorite ? "Убрать из избранного" : "Добавить в избранное";
            
            // Обновляем класс элемента станции
            const stationElement = favoriteBtn.closest('.music-item');
            if (stationElement) {
                stationElement.classList.toggle('favorite', station.favorite);
            }
        }
    }
}

function toggleFavoritesFilter() {
    showOnlyFavorites = !showOnlyFavorites;
    loadStationsList();
    
    // Обновляем кнопку фильтра
    if (favoritesFilterBtn) {
        favoritesFilterBtn.classList.toggle('active', showOnlyFavorites);
        favoritesFilterBtn.textContent = showOnlyFavorites ? 'Все треки' : 'Только избранные';
    }
}

function loadStationsList() {
    stationsContainer.innerHTML = '';
    
    // Фильтруем треки если включен фильтр
    const stationsToShow = showOnlyFavorites
        ? radioStations.filter(station => station.favorite)
        : radioStations;

    stationsToShow.forEach((station, index) => {
        const stationElement = document.createElement('div');
        stationElement.className = `music-item ${index === currentStationIndex ? 'active' : ''}`;
        stationElement.dataset.id = station.id;
        
        // Добавляем класс favorite если трек в избранном
        if (station.favorite) {
            stationElement.classList.add('favorite');
        }

        // Контейнер для картинки и кнопки избранного
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'music-item-img-wrapper';
        
        const img = document.createElement('img');
        const srcToUse = station.img ? station.img : svgPlaceholder;
        img.src = srcToUse;
        img.alt = station.name || 'station image';
        img.className = 'station-image';

        // Кнопка избранного - теперь vbutton с изображением внутри
        const favoriteBtn = document.createElement('vbutton');
        favoriteBtn.className = 'favorite-btn';
        favoriteBtn.dataset.id = station.id;
        
        // Создаем изображение для кнопки
        const favoriteImg = document.createElement('img');
        favoriteImg.src = station.favorite ? "Фото/like1.png" : "Фото/like2.png";
        favoriteImg.alt = station.favorite ? "В избранном" : "Добавить в избранное";
        favoriteImg.className = 'favorite-icon';
        
        // Добавляем изображение внутрь vbutton
        favoriteBtn.appendChild(favoriteImg);
        favoriteBtn.title = station.favorite ? "Убрать из избранного" : "Добавить в избранное";

        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Предотвращаем срабатывание клика по станции
            toggleFavorite(station.id);
        });

        imgWrapper.appendChild(img);
        imgWrapper.appendChild(favoriteBtn);

        // Информация о станции
        const infoWrapper = document.createElement('div');
        infoWrapper.className = 'music-item-info';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'music-item-name';
        nameDiv.textContent = station.name || '';
        
        const freqDiv = document.createElement('div');
        freqDiv.className = 'music-item-frequency';
        freqDiv.textContent = station.frequency || '';

        infoWrapper.appendChild(nameDiv);
        infoWrapper.appendChild(freqDiv);

        // Сборка элемента станции
        stationElement.appendChild(imgWrapper);
        stationElement.appendChild(infoWrapper);

        // Клик по станции
        stationElement.addEventListener('click', () => {
            setStation(index);
            playRadio();
        });

        stationsContainer.appendChild(stationElement);
    });
}

function setStation(index) {
    if (index < 0 || index >= radioStations.length) return;
    
    currentStationIndex = index;
    const station = radioStations[currentStationIndex];
    
    if (currentStationElement) currentStationElement.textContent = station.name;
    if (currentFrequencyElement) currentFrequencyElement.textContent = station.frequency;
    if (audioPlayer) audioPlayer.src = station.url;
    
    updateActiveStation();
}

function updateActiveStation() {
    const stationItems = document.querySelectorAll('.music-item');
    stationItems.forEach((item, idx) => {
        item.classList.toggle('active', idx === currentStationIndex);
    });
}

function togglePlay() {
    if (isPlaying) pauseRadio();
    else playRadio();
}

function playRadio() {
    if (!audioPlayer) return;
    
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            if (playIcon) playIcon.className = 'fas fa-pause';
            if (playText) playText.textContent = ' ⏸ ';
            if (playBtn) playBtn.classList.add('playing');
        })
        .catch(err => {
            console.error('Ошибка воспроизведения', err);
            alert('Не удалось воспроизвести трек. Проверьте URL или подключение.');
        });
}

function pauseRadio() {
    if (!audioPlayer) return;
    
    audioPlayer.pause();
    isPlaying = false;
    
    if (playIcon) playIcon.className = 'fas fa-play';
    if (playText) playText.textContent = ' ▶';
    if (playBtn) playBtn.classList.remove('playing');
}

function nextStation() {
    currentStationIndex = (currentStationIndex + 1) % radioStations.length;
    setStation(currentStationIndex);
    if (isPlaying) playRadio();
}

function prevStation() {
    currentStationIndex = (currentStationIndex - 1 + radioStations.length) % radioStations.length;
    setStation(currentStationIndex);
    if (isPlaying) playRadio();
}

function setupEventListeners() {
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (prevBtn) prevBtn.addEventListener('click', prevStation);
    if (nextBtn) nextBtn.addEventListener('click', nextStation);
    
    if (favoritesFilterBtn) {
        favoritesFilterBtn.addEventListener('click', toggleFavoritesFilter);
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            if (audioPlayer) audioPlayer.volume = volumeSlider.value / 100;
        });
    }
    
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case ' ':
            case 'Spacebar':
                event.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                prevStation();
                break;
            case 'ArrowRight':
                nextStation();
                break;
            case 'ArrowUp':
                if (volumeSlider) {
                    volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
                    if (audioPlayer) audioPlayer.volume = volumeSlider.value / 100;
                }
                break;
            case 'ArrowDown':
                if (volumeSlider) {
                    volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
                    if (audioPlayer) audioPlayer.volume = volumeSlider.value / 100;
                }
                break;
        }
    });
    
    if (audioPlayer) {
        audioPlayer.addEventListener('error', () => {
            console.error('Ошибка загрузки аудио');
            alert('Не удалось загрузить радиостанцию. Попробуйте другую станцию.');
        });
    }
}

document.addEventListener('DOMContentLoaded', initRadio);
