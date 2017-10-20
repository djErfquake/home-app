// weather
let lat = "39.908702";
let lon = "-83.114147";
let darkskyKey = "c98746a2df07c27aa2a80d00f4e659a8";

// calendar
let calendarClientId = "556674607703-tireknajm8fa3bj03opqs7egoqq7ctu3.apps.googleusercontent.com";
let calendarDiscoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
let calendarScopes = "https://www.googleapis.com/auth/calendar.readonly";
let calendarId = "u2tg5n608ntdtifovljih1m4uo@group.calendar.google.com";

// app
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
  CALENDAR
*****************************************************************************/

// on load, called to load the auth2 library and API client library
let initCalendar = () => {
  console.log("initCalendar");
  gapi.load('client:auth2', initGoogleClient);
};

// intializes the API client library and sets up sign-in state listeners
let initGoogleClient = () => {
  console.log("initGoogleClient");
  gapi.client.init({
    discoveryDocs: calendarDiscoveryDocs,
    clientId: calendarClientId,
    scope: calendarScopes
  }).then(function() {
    // listen for sign-in state changes
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateGoogleSignInStatus);

    // handle the initial sign-in state
    updateGoogleSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}

// called when the signed in status changes, then signs in
let updateGoogleSignInStatus = (isSignedIn) => {
  console.log("updateGoogleSignInStatus");
  //gapi.auth2.getAuthInstance().signIn();
  gapi.auth2.getAuthInstance().signIn().then(function() {
    /*
    // get calendar list

    let calendarRequest = gapi.client.calendar.calendarList.list();
    calendarRequest.execute(function(data) {
      let calendars = data.items;
    });
    */

    let today = new Date();
    let calendarRequest = gapi.client.calendar.events.list({
      'calendarId' : calendarId,
      'timeZone': 'America/New_York',
      'timeMin': today.toISOString(),
      'singleEvents': true,
      'orderBy': 'startTime'});
    calendarRequest.execute(function(data) {
      console.log("calendar events", data);

      let today = new moment();
      let eventCount = 0;

      for (let i = 0; i < data.items.length; i++)
      {
        let calendarDateMoment;
        if (data.items[i].start.date) {
          calendarDateMoment = new moment(data.items[i].start.date);
        } else {
          calendarDateMoment = new moment(data.items[i].start.dateTime);
        }
        let dayDifference = calendarDateMoment.diff(today, 'days');

        if (dayDifference <= 7 && eventCount < 3) {
          //console.log(data.items[i].summary + " is happpening " + calendarDateMoment.fromNow());
          /*
          <div class='calendar-event'>
            <i class='calendar-event-icon fa fa-calendar-o' aria-hidden='true'></i>
            <div class='calendar-event-details'>
              <div class='calendar-event-name'>Fourth of July</div>
              <div class='calendar-event-timeframe'>in 10 hours</div>
            </div>
          </div>
          */

          let eventDom = $('<div>', {class: 'calendar-event', id: 'calendar-event-' + i});
          $('.calendar-container').append(eventDom);
          let eventIcon = $('<div>', {class: 'calendar-event-icon fa', id: 'calendar-event-icon-' + i});
          $('#calendar-event-' + i).append(eventIcon);
          setCalendarIcon('#calendar-event-icon-' + i, data.items[i].summary);
          let eventDetails = $('<div>', {class: 'calendar-event-details', id: 'calendar-event-details-' + i});
          $('#calendar-event-' + i).append(eventDetails);
          let eventName = $('<div>', {class: 'calendar-event-name', id: 'calendar-event-name-' + i});
          $('#calendar-event-details-' + i).append(eventName);
          $('#calendar-event-name-' + i).html(data.items[i].summary);
          let eventTime = $('<div>', {class: 'calendar-event-timeframe', id: 'calendar-event-timeframe-' + i});
          $('#calendar-event-details-' + i).append(eventTime);
          $('#calendar-event-timeframe-' + i).html(calendarDateMoment.fromNow());

          eventCount++;
        }


      }
    });


  });




  /*
  $.ajax({type: 'GET', dataType: 'jsonp', url: "https://www.googleapis.com/calendar/v3/users/me/calendarList", success: function(data, status) {
    // success
    console.log("calendar success", data);
  }, error: function (data, textStatus, errorThrown) {

    // failure
    console.dir(data);
    console.warn("Error with Google Calendar API call: " + data.responseText);
    console.warn("Chrome Error: " + errorThrown.Message);
  }
  });
  */

};


let setCalendarIcon = (className, eventName) => {

  // http://fontawesome.io/icons/
  let eventType = eventName.toLowerCase();
  if (eventType.includes("birthday") || eventType.includes("bday")) {
    $(className).addClass("fa-birthday-cake");
  } else if (eventType.includes("obgyn") || eventType.includes("doctor") || eventType.includes("dr")) {
    $(className).addClass("fa-stethoscope");
  } else if (eventType.includes("trip")) {
    $(className).addClass("fa-plane");
  } else {
    $(className).addClass("fa-calendar-o");
  }
};


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
      $('.temperature-percipitation').html((data.daily.data[0].precipProbability * 100) + "%");

      // check for percipitation
      let willRain = false;
      let rainTime = 0;
      for (let i = 0; i < data.hourly.data.length; i++) {
        if (data.hourly.data[0].precipType == "rain" && data.hourly.data[i].precipProbability > 0.4) {
          rainTime = data.hourly.data[i].time;
          willRain = true;
          break;
        }
      }

      if (willRain) {
        $('.temperature-percipitation-time-container').show();
        let rainMoment = moment.unix(rainTime);
        $('.temperature-percipitation-time').html(rainMoment.format('h a'));
      } else {
        $('.temperature-percipitation-time-container').hide();
        $('.temperature-percipitation-time').html();
      }

      // sub weather
      if (!subWeatherCreated) { createSubWeather(data.daily.data.length - 1); }
      updateSubWeather(data);

    }, error: function (data, textStatus, errorThrown) {

      // failure
      console.dir(data);
      console.warn("Error with Forecast.IO API call: " + data.responseText);
			console.warn("Chrome Error: " + errorThrown.Message);
    }
  });
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
