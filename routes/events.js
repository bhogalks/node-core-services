var express = require('express');
var router = express.Router();

var mongo = require('mongodb');
var mongoDebug = require('node-mongodb-debug-log');
mongoDebug.install(mongo);

var sha1 = require('sha1');
var moment = require('moment');

var MongoClient = require('mongodb').MongoClient;

var url = process.env.MONGO_URL;
var dbName = process.env.DB_SCHEMA;

var EVENTS = 'events';

var db;

const FORMAT_DDMMYYYY = 'DDMMYYYY';
const FORMAT_YYYY_MM_DD = 'YYYY-MM-DD';

MongoClient.connect(url, function (err, database) {
    if (err) return console.log(err);
    db = database.db(dbName);
});

var options = {
    projection: {
        _id: 0,
        description: 1,
        start_time: 1,
        end_time: 1,
        name: 1,
        id: 1,
        place: 1,
        event_times: 1
    }
};

/**
 * @swagger
 * definitions:
 *  FBEvent:
 *   type: object
 *   properties:
 *      description:
 *          type: string
 *      start_time:
 *          type: string
 *      end_time:
 *          type: string
 *      name:
 *          type: string
 *      id:
 *          type: string
 *      place:
 *          type: string
 *      event_times:
 *          type: array
 *          items:
 *              type: object
 */
/**
 * @swagger
 * /events/all:
 *  get:
 *      description: Returns all the events from the facebook page
 *      produces:
 *          - application/json
 *      responses:
 *          '200':
 *              description: All the events from Facebook
 *              schema:
 *                  $ref: '#/definitions/FBEvent'
 */
router.get('/all', function (req, res, next) {
    return new Promise(function (resolve, reject) {
        db.collection(EVENTS).find({}, options).toArray().then(function (value) {
            console.log('returing' , value.length, 'events');
            res.json(value)
        })
    });
});
/**
 * @swagger
 * /events/{from}/{to}:
 *  get:
 *      description: Returns the events within the range from the facebook page
 *      parameters:
 *          - name: from
 *            description: from date (DDMMYYYY)
 *            in: path
 *            required: true
 *            type: string
 *            format: DDMMYYYY
 *          - name: to
 *            description: to date (DDMMYYYY)
 *            in: path
 *            required: true
 *            type: string
 *            format: DDMMYYYY
 *      produces:
 *          - application/json
 *      responses:
 *          '200':
 *              description: All the events from Facebook
 *              schema:
 *                  $ref: '#/definitions/FBEvent'
 */

router.get('/:from/:to', function (req, res, next) {
    var from = req.params.from;
    var to = req.params.to;

    //TODO validation
    var fromDate = moment(from, FORMAT_DDMMYYYY);
    var toDate   = moment(to, FORMAT_DDMMYYYY);

    var fromAsString = fromDate.format(FORMAT_YYYY_MM_DD);
    var toAsString = toDate.format(FORMAT_YYYY_MM_DD);

    return new Promise(function (resolve, reject) {
        db.collection(EVENTS).find({start_time: {$gte: fromAsString, $lte : toAsString}}, options).toArray().then(function (value) {
            console.log('returing' , value.length, 'events');
            res.json(value)
        })
    });
});

module.exports = router;