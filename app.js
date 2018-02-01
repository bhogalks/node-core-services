//Properties should be set manually in Prod
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

var express = require('express');
var scheduler = require('./workers/scheduler');

var app = express();

scheduler.startJobs();

module.exports = app;
