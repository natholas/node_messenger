var request = require('request');
var weather = require('weather-js');
var saidGoodmorning = false;
var gaveWeatherForcast = false;
var botToken = '407383284:AAFkUPHAKD6Ja-IW3Tw0WncPfH4lYox7KDw';
var telegramUrl = 'https://api.telegram.org/bot' + botToken;
function paddToLength(string, length) {
    if (length === void 0) { length = 2; }
    while (string.length < length) {
        string = '0' + string;
    }
    return string;
}
function isWeekend(date) {
    if (date === void 0) { date = new Date(); }
    return [0, 6].indexOf(date.getDay()) < 0;
}
function dateString(date) {
    return date.getFullYear() + '-' + paddToLength((date.getMonth() + 1) + '') + '-' + paddToLength(date.getDate() + '');
}
function sendMessage(text, callback) {
    if (callback === void 0) { callback = null; }
    text = encodeURIComponent(text);
    var url = '/sendMessage?chat_id=-1001131738679&text=' + text;
    request(telegramUrl + url, function (error, response, body) {
        if (error) {
            console.log('error:', error);
        }
        if (callback) {
            callback(body);
        }
    });
}
var Check = /** @class */ (function () {
    function Check(condition, interval) {
        this.condition = condition;
        this.condition();
        var t = this;
        setInterval(function () {
            t.condition();
        }, interval);
    }
    return Check;
}());
var dailyReset = new Check(function () {
    saidGoodmorning = false;
    gaveWeatherForcast = false;
}, 1000 * 60 * 60 * 24);
var goodMorningMessage = new Check(function () {
    if (!saidGoodmorning && new Date().getHours() >= 8 && new Date().getHours() < 9) {
        saidGoodmorning = true;
        sendMessage('Good morning!');
    }
}, 1000 * 60 * 20);
var weatherCheck = new Check(function () {
    if (gaveWeatherForcast)
        return;
    if (!isWeekend() && new Date().getHours() < 7)
        return;
    if (!isWeekend() && new Date().getHours() >= 8)
        return;
    if (isWeekend() && new Date().getHours() < 9)
        return;
    if (isWeekend() && new Date().getHours() >= 10)
        return;
    gaveWeatherForcast = true;
    weather.find({ search: 'Zurich, Switzerland', degreeType: 'C' }, function (err, result) {
        if (err)
            console.log(err);
        else {
            var today = void 0;
            for (var _i = 0, _a = result[0].forecast; _i < _a.length; _i++) {
                var day = _a[_i];
                if (day.date === dateString(new Date())) {
                    today = day;
                    break;
                }
            }
            var string = 'Today is going to be ' + today.skytextday;
            if (!isWeekend() && today.precip > 30) {
                string += '. You might want to bring an umbrella to work today as there is a ' + today.precip + '% chance of rain';
            }
            sendMessage(string);
        }
    });
}, 1000 * 60 * 20);
