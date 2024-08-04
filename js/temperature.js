// Variável para armazenar os parâmetros da URL
let urlParams;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('back-button').addEventListener('click', function () {
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
    function renderWeatherChart(weatherData) {
        const ctx = document.getElementById('weather-chart').getContext('2d');

        // Verifica se o gráfico já existe para destruí-lo antes de criar um novo
        if (window.weatherChart) {
            window.weatherChart.destroy();
        }

        window.weatherChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weatherData.map(data => data.time), // Labels para o eixo X
                datasets: [
                    {
                        label: 'Temperatura (°C)',
                        data: weatherData.map(data => data.temperature),
                        borderColor: 'rgba(33, 54, 68, 1)',
                        backgroundColor: 'rgba(33, 54, 68, 0.2)',
                        fill: true,
                    },
                    {
                        label: 'Umidade (%)',
                        data: weatherData.map(data => data.humidity),
                        borderColor: 'rgba(54, 168, 239, 1)',
                        backgroundColor: 'rgba(54, 168, 239, 0.2)',
                        fill: true,
                    },
                    {
                        label: 'Precipitação (mm)',
                        data: weatherData.map(data => data.precipitation),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: true,
                    },
                    {
                        label: 'Vento (km/h)',
                        data: weatherData.map(data => data.windSpeed),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    }
                }
            }
        });

        // Renderiza os dados meteorológicos em uma tabela
        renderWeatherTable(weatherData);
    }

    // Função para renderizar os dados meteorológicos em uma tabela
    function renderWeatherTable(weatherData) {
        const weatherContainer = document.getElementById('weather-data');
        let tableHTML = `
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Hora</th>
                        <th>Temperatura (°C)</th>
                        <th>Umidade (%)</th>
                        <th>Precipitação (mm)</th>
                        <th>Vento (km/h)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        weatherData.forEach(data => {
            tableHTML += `
                <tr>
                    <td>${data.time}</td>
                    <td>${data.temperature}</td>
                    <td>${data.humidity}</td>
                    <td>${data.precipitation}</td>
                    <td>${data.windSpeed}</td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        weatherContainer.innerHTML = tableHTML;
    }

    // Função para obter dados meteorológicos
    function getWeatherData(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,humidity_2m,precipitation_sum,wind_speed_10m&timezone=America/Sao_Paulo`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const weatherData = data.hourly.time.map((time, index) => ({
                    time: time,
                    temperature: data.hourly.temperature_2m[index],
                    humidity: data.hourly.humidity_2m[index],
                    precipitation: data.hourly.precipitation_sum[index] || 0, // Precipitação pode ser null
                    windSpeed: data.hourly.wind_speed_10m[index] || 0 // Velocidade do vento pode ser null
                }));
                renderWeatherChart(weatherData); // Chama a função para renderizar o gráfico e a tabela
            })
            .catch(error => console.error('Erro ao obter dados meteorológicos:', error));
    }

    // Função para obter previsões meteorológicas
    function getWeatherForecast(lat, lon, period) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,wind_speed_10m_max&timezone=America/Sao_Paulo`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                renderWeatherForecast(data.daily, period); // Chama a função para renderizar as previsões
            })
            .catch(error => console.error('Erro ao obter previsões:', error));
    }

    // Função para renderizar as previsões meteorológicas
    function renderWeatherForecast(forecastData, period) {
        const forecastContainer = document.getElementById('weather-forecast');
        let tableHTML = `
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Máx (°C)</th>
                        <th>Mín (°C)</th>
                        <th>Precipitação (mm)</th>
                        <th>UV Index Máx</th>
                        <th>Vento Máx (km/h)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        forecastData.time.slice(0, period).forEach((time, index) => {
            tableHTML += `
                <tr>
                    <td>${time}</td>
                    <td>${forecastData.temperature_2m_max[index]}</td>
                    <td>${forecastData.temperature_2m_min[index]}</td>
                    <td>${forecastData.precipitation_sum[index]}</td>
                    <td>${forecastData.uv_index_max[index]}</td>
                    <td>${forecastData.wind_speed_10m_max[index]}</td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        forecastContainer.innerHTML = tableHTML;
    }

    // Event listener para o dropdown de intervalo de tempo
    document.getElementById('time-range').addEventListener('change', function () {
        const period = parseInt(this.value, 10);
        const lat = -23.5505; // Latitude de São Paulo (exemplo)
        const lon = -46.6333; // Longitude de São Paulo (exemplo)
        getWeatherForecast(lat, lon, period); // Obtém previsões meteorológicas com base no período selecionado
    });

    // Obtém previsões meteorológicas ao carregar a página
    const initialPeriod = 24; // Período inicial (24 horas)
    const lat = -23.5505; // Latitude de São Paulo (exemplo)
    const lon = -46.6333; // Longitude de São Paulo (exemplo)
    getWeatherForecast(lat, lon, initialPeriod);

    // Dados de condições de saúde (exemplo)
    const healthConditions = [
        { icon: 'fa-temperature-high', text: 'Risco de desidratação. Beba bastante água.' },
        { icon: 'fa-wind', text: 'Possibilidade de ventos fortes. Evite áreas abertas.' },
        { icon: 'fa-cloud-rain', text: 'Chance de chuva. Leve um guarda-chuva.' },
        { icon: 'fa-smog', text: 'Qualidade do ar ruim. Use máscara ao sair.' }
    ];

    // Função para renderizar as condições de saúde
    function renderHealthConditions() {
        const healthList = document.getElementById('health-conditions');
        let listHTML = '';

        healthConditions.forEach(condition => {
            listHTML += `
                <div class="health-condition">
                    <i class="fas ${condition.icon}"></i>
                    <p>${condition.text}</p>
                </div>
            `;
        });

        healthList.innerHTML = listHTML;
    }

    // Renderiza as condições de saúde ao carregar a página
    renderHealthConditions();
});