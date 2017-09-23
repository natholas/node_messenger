var request = require('request');
var weather = require('weather-js');

var saidGoodmorning = false
var gaveWeatherForcast = false

const botToken = '407383284:AAFkUPHAKD6Ja-IW3Tw0WncPfH4lYox7KDw'
const telegramUrl = 'https://api.telegram.org/bot' + botToken

function paddToLength(string: string, length: number = 2) {
  while (string.length < length) {
    string = '0' + string
  }
  return string
}

function isWeekend(date: Date = new Date()) {
  return [0,6].indexOf(date.getDay()) < 0
}

function dateString(date: Date) {
  return date.getFullYear() + '-' + paddToLength((date.getMonth() + 1) + '') + '-' + paddToLength(date.getDate() + '')
}

function sendMessage(text: string, callback: Function = null) {
  text = encodeURIComponent(text)
  let url: string = '/sendMessage?chat_id=-1001131738679&text=' + text
  request(telegramUrl + url, function (error: string, response: string, body: string) {
    if (error) {
      console.log('error:', error);
    }
    if (callback) {
      callback(body)
    }
  });
}

class Check {
  condition: Function
  constructor(condition: Function, interval: number) {
    this.condition = condition
    this.condition()
    let t = this
    setInterval(function() {
      t.condition()
    }, interval)
  }
}

let dailyReset = new Check(function() {
  saidGoodmorning = false
  gaveWeatherForcast = false
}, 1000 * 60 * 60 * 24)

let goodMorningMessage = new Check(function () {
  if (!saidGoodmorning && new Date().getHours() >= 8 && new Date().getHours() < 9) {
    saidGoodmorning = true
    sendMessage('Good morning!')
  }
}, 1000 * 60 * 20)

let weatherCheck = new Check(function () {
  
  if (gaveWeatherForcast) return
  if (!isWeekend() && new Date().getHours() < 7) return
  if (!isWeekend() && new Date().getHours() >= 8) return
  if (isWeekend() && new Date().getHours() < 9) return
  if (isWeekend() && new Date().getHours() >= 10) return

  gaveWeatherForcast = true

  weather.find({ search: 'Zurich, Switzerland', degreeType: 'C' }, function (err: string, result: any) {
    if (err) console.log(err);
    else {
      let today: any
      for (let day of result[0].forecast) {
        if (day.date === dateString(new Date())) {
          today = day
          break;
        }
      }

      let string = 'Today is going to be ' + today.skytextday
      
      if (!isWeekend() && today.precip > 30) {
        string += '. You might want to bring an umbrella to work today as there is a ' + today.precip + '% chance of rain'
      }

      sendMessage(string)
    }
  });
}, 1000 * 60 * 20)