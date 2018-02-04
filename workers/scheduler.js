var schedule = require('node-schedule');
var facebook = require('../services/facebook');
var db = require('../services/eventsPersistence');

const timingSchedule = '00 * * * *';

module.exports = {startJobs};


function startJobs() {
    startJob(timingSchedule, getPublicEventsForGuruNanakDarbarGravesend)
    getPublicEventsForGuruNanakDarbarGravesend();
}

function startJob(timing, fx) {
    schedule.scheduleJob(timing, fx);
}


function getPublicEventsForGuruNanakDarbarGravesend() {
    var fbId = process.env.FB_APP_ID;
    var fbSecret = process.env.FB_ENV_SECRET;
    var pageId = process.env.FB_PAGE_ID;

    console.log('Triggering job for', pageId, 'at',new Date());

    facebook.getEvents(pageId, fbId, fbSecret)
        .then(function (value) {
            return new Promise(function (resolve, reject) {
                console.log('Got',value.length, 'events')
                resolve(value);
            });
        })
        .then(function (events) {
            db.storeEvents(events)
        })
        .catch(function (reason) {
            console.error(reason)
        });
};
