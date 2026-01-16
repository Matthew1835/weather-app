const iconImg = document.getElementById("weather-icon");
const tempEl = document.getElementById("main-temperature");
const feelsEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const windGustEl = document.getElementById("wind-gust");
const weatherEl = document.getElementById("weather-main");
const locationEl = document.getElementById("location");
const dropdown = document.getElementById("city-dropdown")
const getWeatherBtn = document.getElementById("get-weather-btn")

async function getWeather(city) {
    try {
        const response = await fetch(`https://weather-proxy.freecodecamp.rocks/api/city/${city}`);
        const weatherData = await response.json();
        return weatherData;
    } catch (error) {
        console.log(error);
    }
}

async function showWeather(city) {
    try {
        const data = await getWeather(city);
        const { main, name, sys, weather, wind } = data;

        locationEl.textContent = `${name}, ${sys.country}`;

        iconImg.setAttribute("src", weather[0].icon);
        weatherEl.textContent = weather[0].main
        tempEl.textContent = main.temp;
        feelsEl.textContent = main.feels_like;

        humidityEl.textContent = main.humidity;
        windEl.textContent = wind.speed;
        windGustEl.textContent = wind.gust;
    
        console.log(main)
    } catch (error) {
        alert("Something went wrong, please try again later.")
    }
}

getWeatherBtn.addEventListener("click", () => {
    showWeather(dropdown.value);
})

/**
 * weather-icon - weather[0].icon
 * main-temperature - main.temp
 * feels-like - main.feels_like
 * humidity - main.humidity
 * wind - wind.speed
 * wind-gust - wind.gust
 * weather-main - weather[0].main
 * location - name, sys.country
 */