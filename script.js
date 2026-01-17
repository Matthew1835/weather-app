const dropdown = document.getElementById("city-dropdown");
const getWeatherBtn = document.getElementById("get-weather-btn");
const displayContainer = document.querySelector(".display-container");

const iconImg = document.getElementById("weather-icon");
const tempEl = document.getElementById("main-temperature");
const feelsEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const windGustEl = document.getElementById("wind-gust");
const weatherEl = document.getElementById("weather-main");
const locationEl = document.getElementById("location");

const hour = new Date().getHours();
const isDaytime = hour >= 6 && hour < 18;

document.body.classList.add(isDaytime ? "light" : "dark");

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
    if (!city) {
        displayContainer.classList.add("hidden");
        alert("Please select a city");
        return;
    }

    try {
        displayContainer.classList.remove("hidden");

        const data = await getWeather(city);
        if (!data) throw new Error("No weather data");

        const { main, name, sys, weather, wind } = data;

        locationEl.textContent = `${name}, ${sys.country}`;

        if (weather[0]?.icon) {
            iconImg.src = weather[0].icon;
        }

        weatherEl.textContent = (weather[0].main) ? weather[0].main : "N/A";
        tempEl.textContent = (main.temp) ? `${main.temp}° C` : "N/A";
        feelsEl.textContent = (main.feels_like) ? `${main.feels_like}° C` : "N/A";

        humidityEl.textContent = (main.humidity) ? `${main.humidity}%` : "N/A";
        windEl.textContent = (wind.speed) ? `${wind.speed} m/s` : "N/A";
        windGustEl.textContent = (wind.gust) ? `${wind.gust} m/s` : "N/A";
    } catch (error) {
        alert("Something went wrong, please try again later.")
    }
}


getWeatherBtn.addEventListener("click", () => {
    showWeather(dropdown.value);
})