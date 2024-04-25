const apiKey = '07b1a178ecf849c380142902c5612c05';

let map; 
let marker; 

function loadMap(latitude, longitude) {

    if (map) { 
        map.setView([latitude, longitude], 10); 
        if (marker) { 
            marker.setLatLng([latitude, longitude]); 
        } else {

            marker = L.marker([latitude, longitude]).addTo(map); 
        }
    } else {

        map = L.map("map").setView([latitude, longitude], 10); 
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        marker = L.marker([latitude, longitude]).addTo(map);
    }
}

function getWeatherInfo(municipio) {


    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${municipio},co&appid=${apiKey}&lang=es&units=metric`;
    const apiForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${municipio},co&appid=${apiKey}&lang=es&units=metric`;



    Promise.all([fetch(apiUrl), fetch(apiForecastUrl)])
        .then(([currentResponse, forecastResponse]) => {
            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error('No se pudo obtener la información del clima');
            }
            return Promise.all([currentResponse.json(), forecastResponse.json()]);
        })



        .then(([currentData, forecastData]) => {
            const climaInfoDiv = document.getElementById('clima-info');
            climaInfoDiv.innerHTML = `
                <h2>${currentData.name}</h2>
                <h3>Información del Clima</h3>
                <table class="table">
                    <tr>
                        <th>Parámetro</th>
                        <th>Valor</th>
                    </tr>
                    <tr>
                        <td>Temperatura actual</td>
                        <td>${currentData.main.temp} °C</td>
                    </tr>
                    <tr>
                        <td>Sensación térmica</td>
                        <td>${currentData.main.feels_like} °C</td>
                    </tr>
                    <tr>
                        <td>Temperatura mínima</td>
                        <td>${currentData.main.temp_min} °C</td>
                    </tr>
                    <tr>
                        <td>Temperatura máxima</td>
                        <td>${currentData.main.temp_max} °C</td>
                    </tr>
                    <tr>
                        <td>Presión atmosférica</td>
                        <td>${currentData.main.pressure} hPa</td>
                    </tr>
                    <tr>
                        <td>Humedad</td>
                        <td>${currentData.main.humidity}%</td>
                    </tr>
                    <tr>
                        <td>Velocidad del viento</td>
                        <td>${currentData.wind.speed} m/s</td>
                    </tr>
                    <tr>
                        <td>Dirección del viento</td>
                        <td>${currentData.wind.deg}°</td>
                    </tr>
                    <tr>
                        <td>Nubosidad</td>
                        <td>${currentData.clouds.all}%</td>
                    </tr>
                    <tr>
                        <td>Precipitación</td>
                        <td>${currentData.weather[0].description}</td>
                    </tr>
                    <tr>
                        <td>Hora de salida del sol</td>
                        <td>${new Date(currentData.sys.sunrise * 1000).toLocaleTimeString()}</td>
                    </tr>
                    <tr>
                        <td>Hora de puesta del sol</td>
                        <td>${new Date(currentData.sys.sunset * 1000).toLocaleTimeString()}</td>
                    </tr>
                </table>
            `;
            
           


            const hourlyForecast = forecastData.list.slice(0, 48); 
            let hourlyForecastHTML = `
                <h3>Pronóstico por hora para las próximas 48 horas</h3>
                <table class="table">
                    <tr>
                        <th>Hora</th>
                        <th>Temperatura (°C)</th>
                        <th>Descripción</th>
                    </tr>`;
            hourlyForecast.forEach(forecast => {
                hourlyForecastHTML += `
                    <tr>
                 
                    <td>${new Date(forecast.dt * 1000).toLocaleTimeString()}</td>
                        <td>${forecast.main.temp} °C</td>
                        <td>${forecast.weather[0].description}</td>
                    </tr>`;
            });
            hourlyForecastHTML += `</table>`;
            
            climaInfoDiv.innerHTML += hourlyForecastHTML;



            loadMap(currentData.coord.lat, currentData.coord.lon);
        })
        .catch(error => console.error('Error al obtener la información del clima:', error));
}

document.getElementById('municipioSelect').addEventListener('change', function () {
    const municipio = this.value;
 
 
 
    if (municipio) {
        getWeatherInfo(municipio);
    }
});
