const express = require('express');
const http = require('https');
const rss = require('rss')
const config = require('./config.json');

const app = express();

let data;

function getData() {
  let csv = '';
  http.get(config.options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      csv += chunk.toString();
    });
    res.on('end', function() {
      parse(csv);
    });
  }).end();
}

function parse(csv) {
  data = [];
  csv
    .split(/[\n\r]+/)
    .forEach(function(line, li) {
    
      var obj = {};
      line.split(/\t/).forEach(function(entry, ei) {
        obj[config.keys[ei]] = entry.trim();
      });

      obj.date = convertDate(obj.date);
      obj.url = (obj.url === '') ? 'https://www.reddit.com/r/listentothis' : obj.url;

      if (obj.title !== '#N/A' && obj.title !== '#N/A') {
        data.push(obj);
      }
    });

    console.info(JSON.stringify(data, null, 2));
}
function convertDate(dateString) {
  if (dateString === '') {
    return new Date(0)
  }

  const months = [
    'January', 
    'Februari', 
    'March', 
    'April', 
    'May', 
    'June', 
    'July', 
    'August', 
    'September', 
    'October', 
    'November', 
    'December'
  ];

  const month = months.indexOf(dateString.split(' ')[0]);
  const day = parseInt(dateString.split(' ')[1]);
  const year = parseInt(dateString.split(', ')[1]);
  const time = dateString.split('at ')[1];
  let hour = parseInt(time.split(':')[0]);
  const minutes = parseInt(time.split(':')[1]);
  const ampm = time.match(/[A-Z]{2}/)[0];
  if (ampm === 'PM') {
    hour += 12;
  }

  const date = new Date();
  date.setFullYear(year);
  date.setMonth(month);
  date.setDate(day);
  date.setHours(hour);
  date.setMinutes(minutes);

  return date;
}

app.get('/', function (req, res) {
  let feedOptions = config.feedOptions;
  feedOptions.feed_url = 'http://' + req.headers.host;

  const feed = new rss(feedOptions);

  data.forEach(function(entry) {
    feed.item({
      title: entry.title,
      description: entry.raw,
      author: entry.artist,
      date: entry.date.toString(),
      url: entry.url
    });
  });
  
  res.type('rss');
  res.send(feed.xml({indent: true}));
})
 
app.listen(8080)
getData();

setInterval(function() { getData(); }, 3600000);