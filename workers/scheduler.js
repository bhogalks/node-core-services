var schedule = require('node-schedule');
var facebook = require('../services/facebook');

const timingSchedule = '*/1 * * * *';

module.exports = {startJobs};


function startJobs() {


    //startJob(timingSchedule, getPublicEventsForGuruNanakDarbarGravesend)

    getPublicEventsForGuruNanakDarbarGravesend();
}

function startJob(timing, fx) {
    schedule.scheduleJob(timing, fx);
}


function getPublicEventsForGuruNanakDarbarGravesend() {
    var fbId = process.env.FB_APP_ID;
    var fbSecret = process.env.FB_ENV_SECRET;
    var pageId = process.env.FB_PAGE_ID;

    console.log('triggering job for ', pageId );
    facebook.getEvents(pageId, fbId,fbSecret)
};
