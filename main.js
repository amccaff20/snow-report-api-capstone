'use strict';


/**** Hiking Trails API *****/


const trailKey = '200979560-34016932461a258909dfbe882647288f';
const trailUrl = 'https://www.hikingproject.com/data/get-trails'


function formatTrailParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayTrails(responseJson) {
  $('#trail-results').empty();
  $('#trail-results').append(
    responseJson.trails.map(trail =>
      `<h3>${trail.name}</h3> <p>${trail.summary}</p> 
        <p>Trail Rating: ${trail.difficulty}</p> <img src="${trail.imgSmall}"/>
        <p>Elevation: ${trail.low}ft to ${trail.high}ft</p>
        <a href="${trail.url}" target="_blank">More Info</a>
        <p class='coordinates'>Coordinates: 
        <button type='button' id='mapit-button'>${trail.latitude} ${trail.longitude}</button></p>`,
    ))
  handleMapIt(responseJson);
  $('#trail-results').removeClass('hidden');
};


function sortTrails() {
  let selected = $("input[type='radio'][name='sort-trails']:checked");
  let selectedAnswer = "";
  if (selected.length > 0) {
    selectedAnswer = selected.val();
    return selectedAnswer;
  }
};



function getTrails(latitude, longitude) {
  const numTrails = $('#num-results').val();
  const sortBy = sortTrails();
  const length = $('#min-length').val();
  const params = {
    lat: latitude,
    lon: longitude,
    maxResults: numTrails,
    sort: sortBy,
    minLength: length,
    key: trailKey,
  };
  const queryString = formatTrailParams(params)
  const url = trailUrl + '?' + queryString;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayTrails(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function trailForm() {
  $('#js-trail-form').submit(event => {
    event.preventDefault();
    const city = $('#js-hike-city').val();
    getWeather(city);
  });
}

$(trailForm());



//***** Weather API *******/

const weatherKey = '9fc52be9eec442ba9de25202202011';
const weatherUrl = 'https://api.weatherapi.com/v1/forecast.json';


function formatWeatherParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayWeather(responseJson) {
  getTrails(responseJson.location.lat, responseJson.location.lon);
  if (responseJson.alert !== undefined) {
    $('#weather-results').append(
      `<p>Alert: ${responseJson.alert.headline}</p>`
    )
  };
  $('#js-error-message').empty();
  $('#weather-results').empty();
  $('#weather-results').append(
    `<h3>${responseJson.location.name}, ${responseJson.location.region}</h3>
      <h4>Today:</h4>
      <p>Current Condition: ${responseJson.current.condition.text} <img src="https://${responseJson.current.condition.icon.substring(2)}"/> </p>
      <p>Feels Like ${responseJson.current.feelslike_f}ºF</p>
      <p>Wind Speed: ${responseJson.current.wind_mph}mph</p>
      <br>
      <h4>Tomorrow:</h4> <p>Condition: ${responseJson.forecast.forecastday[0].day.condition.text}
      <br>Low of ${responseJson.forecast.forecastday[0].day.mintemp_f}ºF
      <br>High of ${responseJson.forecast.forecastday[0].day.maxtemp_f}ºF</p>
      <br>
      <p>Last updated at ${responseJson.current.last_updated}</p>`)
  $('#weather-icon').empty();
  $('#weather-icon').append(`<img src="https://${responseJson.current.condition.icon.substring(2)}"/>`)

  $('#weather-results').removeClass('hidden');
};

function getWeather(city) {
  const params = {
    key: weatherKey,
    q: city,
  };
  const queryString = formatWeatherParams(params)
  const url = weatherUrl + '?' + queryString + '&days=3';

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayWeather(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}



//***** Map API *******//
const directionsUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving';
const locationUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/-105.1504,39.8130.json?'
const mapKey = 'pk.eyJ1IjoiYW1jY2FmZjA3IiwiYSI6ImNraHhrYThyeTAyc3oycG4wMG40dW5uZGkifQ.yLgQA1X2chc0tTtVLbUE7Q'

mapboxgl.accessToken = 'pk.eyJ1IjoiYW1jY2FmZjA3IiwiYSI6ImNraHhrYThyeTAyc3oycG4wMG40dW5uZGkifQ.yLgQA1X2chc0tTtVLbUE7Q';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-98.5795, 39.8283], // starting position
  zoom: 3 // starting zoom
});
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());


function handleMapIt(responseJson) {
  const markerNum = {lon: "",
                lat: ""};
    for(let i=0; i<responseJson.trails.length; i++){
      markerNum.lon = responseJson.trails[i].longitude;
      markerNum.lat = responseJson.trails[i].latitude;
    }
  $('#mapit-button').click(event => {
    event.preventDefault();
    dropMarker(markerNum);
  });
}


function dropMarker(markerNum) {
  var marker = new mapboxgl.Marker()
    .setLngLat(markerNum)
    .addTo(map);

}