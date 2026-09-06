const VISUAL_CROSSING_KEY = "9NKT9VVJE9Y2A9ATAHRVJHJE7";
const GIPHY_KEY = "miIq06p6B2OvvScCub9IN6jXBIqAsKXN";

async function getWeatherData(location) {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}` +
        `?unitGroup=metric&include=current&key=${VISUAL_CROSSING_KEY}&contentType=json`;

    const response = await fetch(url);

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Weather request failed (${response.status})`);
    }

    return response.json();
}

async function getWeatherGif(query) {
    try {
        const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=1&rating=g`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Giphy request failed (${response.status})`);
        }

        const data = await response.json();
        return data.data[0] ? data.data[0].images.original.url : null;
    } catch (error) {
        console.warn("Could not fetch weather gif:", error.message);
        return null;
    }
}

const ICON_THEMES = {
  'clear-day':            { emoji: '☀️', top: '#5aa9e6', bottom: '#f6c667', accent: '#f6c667', gif: 'sunny' },
  'clear-night':          { emoji: '🌙', top: '#0d1b2a', bottom: '#1b3a5c', accent: '#8fb8e6', gif: 'clear night sky' },
  'partly-cloudy-day':    { emoji: '⛅', top: '#7ba7c9', bottom: '#cfe0ea', accent: '#e8a33d', gif: 'partly cloudy' },
  'partly-cloudy-night':  { emoji: '☁️', top: '#111827', bottom: '#2c3a52', accent: '#8fb8e6', gif: 'cloudy night' },
  'cloudy':               { emoji: '☁️', top: '#5c6b7a', bottom: '#8a97a3', accent: '#e5e9ee', gif: 'cloudy' },
  'fog':                  { emoji: '🌫️', top: '#6b7280', bottom: '#9ca3af', accent: '#e5e9ee', gif: 'foggy' },
  'wind':                 { emoji: '🌬️', top: '#4c6b6f', bottom: '#7fa39a', accent: '#cdeee6', gif: 'windy' },
  'rain':                 { emoji: '🌧️', top: '#26333f', bottom: '#41556b', accent: '#6fb7b7', gif: 'rain' },
  'showers-day':          { emoji: '🌦️', top: '#3d5a73', bottom: '#6e93ad', accent: '#6fb7b7', gif: 'rain showers' },
  'showers-night':        { emoji: '🌧️', top: '#101a26', bottom: '#243447', accent: '#6fb7b7', gif: 'night rain' },
  'thunder-rain':         { emoji: '⛈️', top: '#1a1424', bottom: '#3a2a4d', accent: '#c9a4f0', gif: 'thunderstorm' },
  'thunder-showers-day':  { emoji: '⛈️', top: '#241b33', bottom: '#493a63', accent: '#c9a4f0', gif: 'thunderstorm' },
  'thunder-showers-night':{ emoji: '⛈️', top: '#140f1e', bottom: '#2c2140', accent: '#c9a4f0', gif: 'thunderstorm night' },
  'snow':                 { emoji: '❄️', top: '#9db4c0', bottom: '#e7edf2', accent: '#ffffff', gif: 'snow' },
  'snow-showers-day':     { emoji: '🌨️', top: '#8ba2b0', bottom: '#dfe7ee', accent: '#ffffff', gif: 'snow' },
  'snow-showers-night':   { emoji: '🌨️', top: '#232c36', bottom: '#4a5a6b', accent: '#ffffff', gif: 'snow night' },
};

const DEFAULT_THEME = { emoji: '❓', top: '#1b2430', bottom: '#2e3a55', accent: '#e8a33d', gif: 'weather' };

function getTheme(icon) {
    return ICON_THEMES[icon] || DEFAULT_THEME;
}

function processWeatherData(rawData) {
    const current = rawData.currentConditions;

    return {
        temperatureC: current.temp,
        feelsLikeC: current.feelslike,
        humidity: current.humidity,
        windspeed: current.windspeed,
        conditions: current.conditions,
        icon: current.icon,
        resolvedAddress: rawData.resolvedAddress,
    };
}

const form = document.getElementById("location-form");
const input = document.getElementById("location-input");
const errorEl = document.getElementById("error");
const loadingEl = document.getElementById("loading");
const resultEl = document.getElementById("result");
const toggleBtn = document.getElementById("unit-toggle");
const gifEl = document.getElementById("weather-gif");

let lastWeather = null;
let unit = "C";

function setLoading(isLoading) {
    loadingEl.hidden = !isLoading;
    form.querySelector("button").disabled = isLoading;
}

async function handleLocationSubmit(location) {
    errorEl.textContent = "";
    setLoading(true);

    try {
        const rawData = await getWeatherData(location);
        const weather = processWeatherData(rawData);
        lastWeather = weather;

        console.log(weather);

        renderWeather();
        applyTheme(weather.icon);

        const theme = getTheme(weather.icon);
        const gifUrl = await getWeatherGif(theme.gif);
        showGif(gifUrl);
    } catch (error) {
        errorEl.textContent = error.message;
        resultEl.hidden = true;
    } finally {
        setLoading(false);
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const location = input.value.trim();
    if (!location) {
        errorEl.textContent = "Type a city name first.";
        return;
    }
    handleLocationSubmit(location);
});

function celsiusToFahrenheit(c) {
    return (c * 9) / 5 + 32;
}

function formatTemp(celsiusValue) {
    const value = unit === "C" ? celsiusValue : celsiusToFahrenheit(celsiusValue);
    return `${Math.round(value)}°${unit}`;
}

function renderWeather() {
    if (!lastWeather) return;

    const theme = getTheme(lastWeather.icon);

    resultEl.hidden = false;
    resultEl.querySelector(".location").textContent = lastWeather.resolvedAddress;
    resultEl.querySelector(".icon").textContent = theme.emoji;
    resultEl.querySelector(".description").textContent = lastWeather.conditions;
    resultEl.querySelector(".temp").textContent = formatTemp(lastWeather.temperatureC);
    resultEl.querySelector(".feels-like").textContent = formatTemp(lastWeather.feelsLikeC);
    resultEl.querySelector(".humidity").textContent = `${Math.round(lastWeather.humidity)}%`;
    resultEl.querySelector(".wind").textContent = `${Math.round(lastWeather.windSpeed)} km/h`;
}

function applyTheme(icon) {
    const theme = getTheme(icon);
    document.body.style.setProperty("--bg-top", theme.top);
    document.body.style.setProperty("--bg-bottom", theme.bottom);
    document.body.style.setProperty("--accent", theme.accent);
}

function showGif(url) {
    if (!url) {
        gifEl.hidden = true;
        gifEl.src = "";
        return;
    }
    gifEl.src = url;
    gifEl.alt = `Animated gif representing: ${lastWeather.conditions}`;
    gifEl.hidden = false;
}

toggleBtn.addEventListener("click", () => {
    unit = unit === "C" ? "F" : "C";
    toggleBtn.textContent = unit === "C" ? 'Show °F' : 'Show °C';
    renderWeather();
})