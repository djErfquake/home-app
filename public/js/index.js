let lat = "39.908702";
let lon = "-83.114147";
let darkskyKey = "c98746a2df07c27aa2a80d00f4e659a8";
let clockInterval, weatherInterval;
let subWeatherCreated = false;
let numOfSubWeathers = 0;

$(document).ready(() => {

  updateClock();
  clockInterval = setInterval(updateClock, 1000); // update every second

  updateWeather();
  weatherInterval = setInterval(updateWeather, 900000); // update every 15 minutes

});


/*****************************************************************************
  WEATHER
*****************************************************************************/

let updateWeather = () => {
  $.ajax({type: 'GET', dataType: 'jsonp', url: "https://api.darksky.net/forecast/" + darkskyKey + "/" + lat + "," + lon, success: function(data, status) {

      // success

      // main weather
      console.log("darksky data", data);
      $('.temperature-number').html(Math.round(data.currently.temperature) + "°");
      setWeatherIcon('.temperature-icon', data.currently.icon);
      $('.temperature-description').html(data.hourly.summary);

      // extras
      $('.temperature-high-and-low').html(Math.round(data.daily.data[0].apparentTemperatureHigh) + "°/" + Math.round(data.daily.data[0].apparentTemperatureLow) + "°");
      setPercipitationIcon('.temperature-percipitation-icon', data.daily.data[0].precipType);
      $('.temperature-percipitation').html(data.daily.data[0].precipProbability + "%");

      // sub weather
      if (!subWeatherCreated) { createSubWeather(data.daily.data.length - 1); }
      updateSubWeather(data);

    }, error: function (data, textStatus, errorThrown) {

      // failure
      console.dir(data);
      console.warn("Error with Forecast.IO API call: " + data.responseText);
			console.warn("Chrome Error: " + errorThrown.Message);
    }
  })
};

let setWeatherIcon = (className, weatherIcon) => {

  // TODO: add support for differentiating between day and night
  // https://erikflowers.github.io/weather-icons/

  //console.log("setting weather icon to [" + weatherIcon + "]");
  switch (weatherIcon) {
    case "clear-day":
      $(className).addClass("wi-day-sunny");
      break;
    case "clear-night":
      $(className).addClass("wi-night-clear");
      break;
    case "rain":
      $(className).addClass("wi-rain");
      break;
    case "snow":
      $(className).addClass("wi-snow");
      break;
    case "sleet":
      $(className).addClass("wi-sleet");
      break;
    case "wind":
      $(className).addClass("wi-windy");
      break;
    case "fog":
      $(className).addClass("wi-fog");
      break;
    case "cloudy":
      $(className).addClass("wi-cloudy");
      break;
    case "partly-cloudy-day":
      $(className).addClass("wi-day-cloudy");
      break;
    case "partly-cloudy-night":
      $(className).addClass("wi-night-alt-cloudy");
      break;
    case "hail":
      $(className).addClass("wi-hail");
      break;
    case "thunderstorm":
      $(className).addClass("wi-thunderstorm");
      break;
    case "tornado":
      $(className).addClass("wi-tornado");
      break;
    default:
      $(className).addClass("wi-thermometer");
    break;

  }
};

let setPercipitationIcon = (className, percipIcon) => {

  // https://erikflowers.github.io/weather-icons/

  //console.log("setting percipitation icon to [" + percipIcon + "]");
  switch (percipIcon) {
    case "rain":
      $(className).addClass("wi-raindrop");
      break;
    case "snow":
      $(className).addClass("wi-snowflake-cold");
      break;
    case "sleet":
      $(className).addClass("wi-sleet");
      break;
    default:
      $(className).addClass("wi-raindrop");
    break;

  }
};

let createSubWeather = (numOfSubDays) => {
    /*
    <div class='temperature-sub' id='temperature-sub-0'>
      <div class='temperature-sub-day' id='temperature-sub-day-0'>SAT</div>
      <i class='temperature-sub-icon wi wi-day-cloudy'id='temperature-sub-icon-0'></i>
      <div class='temperature-sub-number'id='temperature-sub-number-0'>67°</div>
    </div>
    */
    numOfSubWeathers = numOfSubDays;

    for (let i = 0; i < numOfSubDays; i++) {
      let sub = $('<div>', {class: 'temperature-sub', id: 'temperature-sub-' + i});
      $('.temperature-sub-container').append(sub);
      let subDay = $('<div>', {class: 'temperature-sub-day', id: 'temperature-sub-day-' + i});
      $('#temperature-sub-' + i).append(subDay);
      let subIcon = $('<div>', {class: 'temperature-sub-icon wi', id: 'temperature-sub-icon-' + i});
      $('#temperature-sub-' + i).append(subIcon);
      let subNumber = $('<div>', {class: 'temperature-sub-number', id: 'temperature-sub-number-' + i});
      $('#temperature-sub-' + i).append(subNumber);
    }

    subWeatherCreated = true;
};

let updateSubWeather = (weatherData) => {

  if (subWeatherCreated) {
    for (let i = 0; i < weatherData.daily.data.length - 1; i++) {
      $('#temperature-sub-number-' + i).html(Math.round(weatherData.daily.data[i + 1].apparentTemperatureHigh) + "°");

      setWeatherIcon('#temperature-sub-icon-' + i, weatherData.daily.data[i + 1].icon);

      let dailyMoment = moment.unix(weatherData.daily.data[i + 1].time);
      $('#temperature-sub-day-' + i).html(dailyMoment.format('ddd'));
    }
  }

};


/*****************************************************************************
  TIME
*****************************************************************************/

let updateClock = () => {

  let m = new moment();
  $('.clock').html(m.format('h:mm A'));
  $('.date').html(m.format('dddd MMMM do YYYY'));

};
