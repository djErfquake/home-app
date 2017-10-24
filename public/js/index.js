// weather
let lat = "39.908702";
let lon = "-83.114147";
let darkskyKey = "c98746a2df07c27aa2a80d00f4e659a8";

// calendar
let calendarClientId = "556674607703-tireknajm8fa3bj03opqs7egoqq7ctu3.apps.googleusercontent.com";
let calendarDiscoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
let calendarScopes = "https://www.googleapis.com/auth/calendar.readonly";
let familyCalendarId = "u2tg5n608ntdtifovljih1m4uo@group.calendar.google.com";
let holidayCalendarId = "en.usa#holiday@group.v.calendar.google.com";

// app
let clockInterval, weatherInterval, calendarInterval;
let subWeatherCreated = false;
let numOfSubWeathers = 0;
let calendarEvents = [];
let calendarsUpdatedCount = 0;
let eventCount = 0;

$(document).ready(() => {

  updateClock();
  clockInterval = setInterval(updateClock, 1000); // update every second

  updateWeather();
  weatherInterval = setInterval(updateWeather, 900000); // update every 15 minutes

  $('.temperature-icon').click(function() { temperatureIconClicked(); });
});

let temperatureIconClicked = () => {

};

/*****************************************************************************
  CALENDAR
*****************************************************************************/

// on load, called to load the auth2 library and API client library
let initCalendar = () => {
  gapi.load('client:auth2', initGoogleClient);
};

// intializes the API client library and sets up sign-in state listeners
let initGoogleClient = () => {
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

  gapi.auth2.getAuthInstance().signIn().then(function() {

    /*
    // get calendar list
    let calendarRequest = gapi.client.calendar.calendarList.list();
    calendarRequest.execute(function(data) {
      let calendars = data.items;
      console.log("calendar list", data);
    });
    */

    updateCalendars();
    calendarInterval = setInterval(updateCalendars, 10800000); // update every 3 hours

  });

};

let updateCalendars = () => {
  eventCount = 0;
  calendarsUpdatedCount = 0;
  $('.calendar-container').html(""); // clear calendar
  calendarEvents = [] // clear array

  updateCalendar(familyCalendarId);
  updateCalendar(holidayCalendarId);
};

let updateCalendar = (calendarId) => {

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

    for (let i = 0; i < 5; i++)
    {
      //console.log("looking at", data.items[i]);
      let calendarDateMoment;
      if (data.items[i].start.date) {
        calendarDateMoment = new moment(data.items[i].start.date);
      } else {
        calendarDateMoment = new moment(data.items[i].start.dateTime);
      }
      let dayDifference = calendarDateMoment.diff(today, 'days');

      //console.log(data.items[i].summary + " is happpening at " + calendarDateMoment.format('MMMM Do YYYY, h:mm:ss a'));
      calendarEvents.push({'event': data.items[i], 'timeUntil': calendarDateMoment, 'fromNow': calendarDateMoment.fromNow()});
    }

    calendarsUpdatedCount++;
    if (calendarsUpdatedCount == 2) {// wait for two calendars

      // sort events all together
      calendarEvents.sort(function(a, b) {
        return a.timeUntil - b.timeUntil;
      });
      console.log("sorted events", calendarEvents);

      // once sorted, only show first three and if they are the same week
      for (let i = 0; i < calendarEvents.length; i++) {

        let dayDifference = calendarEvents[i].timeUntil.diff(today, 'days');
        if (dayDifference <= 7 && eventCount < 3) {
          //console.log(data.items[i].summary + " is happpening " + calendarDateMoment.fromNow());

          createEvent(calendarEvents[eventCount], eventCount);
          eventCount++;
        }
      }
    }
  });

};

let createEvent = (eventInfo, index) => {
  /*
  <div class='calendar-event'>
    <i class='calendar-event-icon fa fa-calendar-o' aria-hidden='true'></i>
    <div class='calendar-event-details'>
      <div class='calendar-event-name'>Fourth of July</div>
      <div class='calendar-event-timeframe'>in 10 hours</div>
    </div>
  </div>
  */

  let eventDom = $('<div>', {class: 'calendar-event', id: 'calendar-event-' + index});
  $('.calendar-container').append(eventDom);
  let eventIcon = $('<div>', {class: 'calendar-event-icon fa', id: 'calendar-event-icon-' + index});
  $('#calendar-event-' + index).append(eventIcon);
  setCalendarIcon('#calendar-event-icon-' + index, eventInfo.event.summary);
  let eventDetails = $('<div>', {class: 'calendar-event-details', id: 'calendar-event-details-' + index});
  $('#calendar-event-' + index).append(eventDetails);
  let eventName = $('<div>', {class: 'calendar-event-name', id: 'calendar-event-name-' + index});
  $('#calendar-event-details-' + index).append(eventName);
  $('#calendar-event-name-' + index).html(eventInfo.event.summary);
  let eventTime = $('<div>', {class: 'calendar-event-timeframe', id: 'calendar-event-timeframe-' + index});
  $('#calendar-event-details-' + index).append(eventTime);

  // is today?
  let eventTimeFrame = eventInfo.fromNow;
  if (eventTimeFrame.includes("ago")) {
    eventTimeFrame = "Today";

    // multiple day
    let endDate;
    if (eventInfo.event.end.date) {
      endDate = new moment(eventInfo.event.end.date);
    } else {
      endDate = new moment(eventInfo.event.end.dateTime);
    }

    let eventDuration = endDate.diff(eventInfo.timeUntil, 'days');
    console.log(eventInfo.event.summary, eventDuration);
    if (eventDuration > 1) {
      //eventTimeFrame += " for " + eventDuration;
      eventTimeFrame += ", for " + eventDuration + " days";
    }
  }





  $('#calendar-event-timeframe-' + index).html(eventTimeFrame);
}


let setCalendarIcon = (className, eventName) => {

  // http://fontawesome.io/icons/
  let eventType = eventName.toLowerCase();
  if (eventType.includes("birthday") || eventType.includes("bday")) {
    $(className).addClass("fa-birthday-cake");
  } else if (eventType.includes("trip")) {
    $(className).addClass("fa-plane");
  } else if (eventType.includes("star wars")) {
    $(className).addClass("fa-rebel");
  } else if (eventType.includes("anniversary") || eventType.includes("valentine")) {
    $(className).addClass("fa-heart");
  } else if (eventType.includes("halloween") || eventType.includes("trick or treat")) {
    $(className).addClass("fa-snapchat-ghost");
  } else if (eventType.includes("soccer") || eventType.includes("crew")) {
    $(className).addClass("fa-futbol-o");
  } else if (eventType.includes("basketball")) {
    $(className).addClass("fa-dribbble");
  } else if (eventType.includes("christmas") || eventType.includes("holiday") || eventType.includes("xmas")) {
    $(className).addClass("fa-tree");
  } else if (eventType.includes("dinner") || eventType.includes("lunch")) {
    $(className).addClass("fa-cutlery");
  } else if (eventType.includes("beer") || eventType.includes("drinks")) {
    $(className).addClass("fa-beer");
  } else if (eventType.includes("shower")) {
    $(className).addClass("fa-gift");
  } else if (eventType.includes("movie")) {
    $(className).addClass("fa-film");
  } else if (eventType.includes("daylight saving")) {
    $(className).addClass("fa-clock-o");
  } else if (eventType.includes("dark week")) {
    $(className).addClass("fa-calendar-times-o");
  } else if ((eventType.includes("vet") && !eventType.includes("veterans")) || eventType.includes("darcy") || eventType.includes("puppy") || eventType.includes("dog")) {
    $(className).addClass("fa-paw");
  } else if (eventType.includes("thea") || (eventType.includes("baby"))) {
    $(className).addClass("fa-child");
  } else if (eventType.includes("book") || (eventType.includes("bible"))) {
    $(className).addClass("fa-book");
  } else if (eventType.includes("obgyn") || eventType.includes("doctor") || eventType.includes("dr")) {
    $(className).addClass("fa-stethoscope");
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
        if (data.hourly.data[i].precipType == "rain" && data.hourly.data[i].precipProbability > 0.4) {
          if (i > 0) {
            rainTime = rainTime = data.hourly.data[i - 1].time;
          } else {
            rainTime = data.hourly.data[i].time;
          }
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
  $('.date').html(m.format('dddd MMMM Do YYYY'));

};
