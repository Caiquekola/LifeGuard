// Variável para armazenar os parâmetros da URL
let urlParams;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('back-button').addEventListener('click', function() {
        window.history.back(); // Volta para a tela anterior
    });

    // Obtém parâmetros da URL
    urlParams = new URLSearchParams(window.location.search);
    const temp = urlParams.get('temp');
    const weatherCode = urlParams.get('weatherCode');

    // Verifica se o elemento existe antes de manipular
    const weatherAlertsElement = document.getElementById('weather-alerts');
    if (weatherAlertsElement) {
        weatherAlertsElement.innerHTML = `
            <h3>Temperatura Atual</h3>
            <p>Temperatura: ${temp} °C</p>
        `;
    } else {
        console.error('Elemento weather-alerts não encontrado.');
    }

    // Função para gerar gráficos de temperatura
    function renderTemperatureChart(temperatureData) {
        const ctx = document.getElementById('temperature-chart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: temperatureData.map(data => data.time), // Labels para o eixo X
                datasets: [{
                    label: 'Temperatura (°C)',
                    data: temperatureData.map(data => data.temperature), // Valores para o eixo Y
                    borderColor: 'rgba(33, 54, 68, 1)',
                    backgroundColor: 'rgba(33, 54, 68, 0.2)',
                    fill: true,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    }
                }
            }
        });
    }

    // Função para obter dados de temperatura
    function getTemperatureData(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=America/Sao_Paulo`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const temperatureData = data.hourly.temperature_2m.map((temp, index) => ({
                    time: data.hourly.time[index],
                    temperature: temp
                }));
                renderTemperatureChart(temperatureData); // Chama a função para renderizar o gráfico
            })
            .catch(error => console.error('Erro ao obter dados de temperatura:', error));
    }

    // Função para obter previsões meteorológicas
    function getWeatherForecast(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=America/Sao_Paulo`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                renderTemperatureForecast(data.daily); // Chama a função para renderizar as previsões
            })
            .catch(error => console.error('Erro ao obter previsões:', error));
    }

    // Função para renderizar as previsões meteorológicas
    function renderTemperatureForecast(forecastData) {
        const forecastContainer = document.getElementById('weather-forecast');
        forecastContainer.innerHTML = '';
        forecastData.time.forEach((time, index) => {
            forecastContainer.innerHTML += `
                <p><strong>${time}</strong>: Máx: ${forecastData.temperature_2m_max[index]} °C, Mín: ${forecastData.temperature_2m_min[index]} °C</p>
            `;
        });
    }

    // Obtém a localização da URL (latitude e longitude)
    const lat = urlParams.get('lat');
    const lon = urlParams.get('lon');

    if (lat && lon) {
        getTemperatureData(lat, lon); // Chama a função para obter dados de temperatura
        getWeatherForecast(lat, lon); // Chama a função para obter previsões
    } else {
        console.error('Coordenadas não fornecidas.');
    }

    // Após obter a temperatura atual, chame essas funções
    const currentTemp = parseFloat(temp); // Obtendo a temperatura da URL

    if (!isNaN(currentTemp)) {
        updateTemperatureAlerts(currentTemp);
        updateHealthConditions(currentTemp);
    }
});

// Função para atualizar alertas de temperatura
function updateTemperatureAlerts(temperature) {
    const alertsContainer = document.getElementById('temperature-alerts');
    alertsContainer.innerHTML = ''; // Limpa conteúdo anterior

    if (temperature > 30) {
        alertsContainer.innerHTML += '<p><strong>Atenção:</strong> Temperatura elevada! Mantenha-se hidratado.</p>';
    } else if (temperature < 10) {
        alertsContainer.innerHTML += '<p><strong>Atenção:</strong> Temperatura baixa! Use roupas adequadas.</p>';
    } else {
        alertsContainer.innerHTML += '<p>Temperatura dentro dos limites normais.</p>';
    }
}

// Função para atualizar condições de saúde
function updateHealthConditions(temperature) {
    const healthList = document.getElementById('health-list');
    healthList.innerHTML = ''; // Limpa conteúdo anterior

    // Condições com base na temperatura
    if (temperature > 30) {
        healthList.innerHTML += '<li><strong>Ondas de calor:</strong> Risco de desidratação e golpes de calor.</li>';
    } 
    if (temperature < 10) {
        healthList.innerHTML += '<li><strong>Frio intenso:</strong> Risco de hipotermia e congelamento.</li>';
    } 
    if (temperature >= 10 && temperature <= 30) {
        healthList.innerHTML += '<li><strong>Temperaturas amenas:</strong> Risco de doenças respiratórias.</li>';
    }
}
