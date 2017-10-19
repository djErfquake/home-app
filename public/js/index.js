let lat = "39.908702";
let lon = "-83.114147";
let darkskyKey = "c98746a2df07c27aa2a80d00f4e659a8";
let clockInterval, weatherInterval;

$(document).ready(() => {

  updateClock();
  clockInterval = setInterval(updateClock, 1000); // update every second

  updateWeather();
  weatherInterval = setInterval(updateWeather, 900000); // update every 15 minutes

});

let updateWeather = () => {
  $.ajax({type: 'GET', dataType: 'jsonp', url: "https://api.darksky.net/forecast/" + darkskyKey + "/" + lat + "," + lon, success: function(data, status) {

      // success
      console.log("darksky data", data);
      $('.temperature-number').html(Math.round(data.currently.temperature) + "°");
      setWeatherIcon(data.currently.icon);

    }, error: function (data, textStatus, errorThrown) {

      // failure
      console.dir(data);
      console.warn("Error with Forecast.IO API call: " + data.responseText);
			console.warn("Chrome Error: " + errorThrown.Message);
    }
  })
};

let updateClock = () => {


};

let setWeatherIcon = (weatherIcon) => {

  // TODO: add support for differentiating between day and night
  // https://erikflowers.github.io/weather-icons/

  console.log("setting weather icon to [" + weatherIcon + "]");
  switch (weatherIcon) {
    case "clear-day":
      $('.temperature-icon').addClass("wi-day-sunny");
      break;
    case "clear-night":
      $('.temperature-icon').addClass("wi-night-clear");
      break;
    case "rain":
      $('.temperature-icon').addClass("wi-rain");
      break;
    case "snow":
      $('.temperature-icon').addClass("wi-snow");
      break;
    case "sleet":
      $('.temperature-icon').addClass("wi-sleet");
      break;
    case "wind":
      $('.temperature-icon').addClass("wi-windy");
      break;
    case "fog":
      $('.temperature-icon').addClass("wi-fog");
      break;
    case "cloudy":
      $('.temperature-icon').addClass("wi-cloudy");
      break;
    case "partly-cloudy-day":
      $('.temperature-icon').addClass("wi-day-cloudy");
      break;
    case "partly-cloudy-night":
      $('.temperature-icon').addClass("wi-night-alt-cloudy");
      break;
    case "hail":
      $('.temperature-icon').addClass("wi-hail");
      break;
    case "thunderstorm":
      $('.temperature-icon').addClass("wi-thunderstorm");
      break;
    case "tornado":
      $('.temperature-icon').addClass("wi-tornado");
      break;
    default:
    $('.temperature-icon').addClass("wi-thermometer");
    break;

  }
};
