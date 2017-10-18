let lat = "39.908702";
let lon = "-83.114147";
let darkskyKey = "c98746a2df07c27aa2a80d00f4e659a8";

$(document).ready(() => {

  updateWeather();


});

let updateWeather = () => {
  $.ajax({type: 'GET', dataType: 'jsonp', url: "https://api.darksky.net/forecast/" + darkskyKey + "/" + lat + "," + lon, success: function(data, status) {

      // success
      console.log("darksky data", data);
      $('.temperature').html(data.currently.temperature + "°");

    }, error: function (data, textStatus, errorThrown) {

      // failure
      console.dir(data);
      console.warn("Error with Forecast.IO API call: " + data.responseText);
			console.warn("Chrome Error: " + errorThrown.Message);
    }
  })
};
