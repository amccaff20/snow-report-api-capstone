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
  console.log(responseJson);
  $('#trail-results').empty();
    $('#trail-results').append(
      responseJson.trails.map(trail => `<h3>${trail.name}</h3> <p>${trail.summary}</p>`)
    ); 
  $('#trail-results').removeClass('hidden');
};



function getTrails(latitude, longitude) {
  console.log('getting trails');
  const params = {
    lat: latitude,
    lon: longitude,
    key: trailKey,
  };
  const queryString = formatTrailParams(params)
  const url = trailUrl + '?' + queryString;

  console.log(url);

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
    //getTrails(city);
    $("#js-trail-form")[0].reset();
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
  console.log(responseJson);
  getTrails(responseJson.location.lat, responseJson.location.lon);
  if (responseJson.alert !== undefined){
    $('#weather-results').append(
      `<p>Alert: ${responseJson.alert.headline}</p>`
    )};
  $('#weather-results').empty();
    $('#weather-results').append(
      `<h3>${responseJson.location.name}, ${responseJson.location.region}</h3>
      <p>Current Condition: ${responseJson.current.condition.text} <img src="https://${responseJson.current.condition.icon.substring(2)}"/> </p>
      <p>Feels Like ${responseJson.current.feelslike_f}ºF</p>
      <p>Wind Speed: ${responseJson.current.wind_mph}mph</p>
      <p>Last updated at ${responseJson.current.last_updated}</p>`)
      
  $('#weather-results').removeClass('hidden');
};

function getWeather(city) {
  console.log('getting weather');
  const params = {
    key: weatherKey,
    q: city,
  };
  const queryString = formatWeatherParams(params)
  const url = weatherUrl + '?' + queryString + '&days=3';

  console.log(url);

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





//***** Stores API *******//