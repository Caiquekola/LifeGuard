let map;
let selectedMarker;

function initMap() {
    // Inicializa o mapa no centro do Brasil
    map = L.map('map').setView([-14.2350, -51.9253], 4);

    // Adiciona a camada de tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Evento de clique no mapa
    map.on('click', function(e) {
        addMarker(e.latlng);
    });

    // Adiciona evento de clique no ícone de GPS
    document.getElementById('gps-button').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            alert("Geolocalização não é suportada por este navegador.");
        }
    });

    // Configura o autocomplete
    setupAutocomplete();
}

function addMarker(latlng) {
    // Remove o marcador anterior, se existir
    if (selectedMarker) {
        map.removeLayer(selectedMarker);
    }

    // Adiciona um novo marcador na posição escolhida
    selectedMarker = L.marker(latlng).addTo(map)
        .bindPopup('Localização escolhida: ' + latlng.toString())
        .openPopup();

    // Habilita o botão de confirmação
    document.getElementById('confirm-location').disabled = false;

    // Armazena a localização escolhida
    document.getElementById('confirm-location').onclick = function() {
        getWeatherAlerts(latlng.lat, latlng.lng);
    };
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    const latlng = L.latLng(lat, lon);
    map.setView(latlng, 13);
    addMarker(latlng);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("Usuário negou o pedido de Geolocalização.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Informações de localização estão indisponíveis.");
            break;
        case error.TIMEOUT:
            alert("O pedido para obter a localização do usuário expirou.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Um erro desconhecido ocorreu.");
            break;
    }
}

function setupAutocomplete() {
    const placesAutocomplete = places({
        appId: 'YOUR_APP_ID', // Substitua com seu appId
        apiKey: 'YOUR_API_KEY', // Substitua com sua apiKey
        container: document.querySelector('#location-input')
    });

    placesAutocomplete.on('change', function resultSelected(e) {
        const lat = e.suggestion.latlng.lat;
        const lon = e.suggestion.latlng.lng;
        const latlng = L.latLng(lat, lon);
        map.setView(latlng, 13);
        addMarker(latlng);
    });
}

function getWeatherAlerts(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Redireciona para a nova página com os dados de temperatura e coordenadas
            window.location.href = `temperatura.html?temp=${data.current_weather.temperature}&weatherCode=${data.current_weather.weathercode}&lat=${lat}&lon=${lon}`;
        })
        .catch(error => {
            console.error('Erro ao obter os alertas climáticos:', error);
            alert('Não foi possível obter os alertas climáticos. Tente novamente mais tarde.');
        });
}

// Chama a função para inicializar o mapa
initMap();
