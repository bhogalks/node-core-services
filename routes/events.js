var express = require('express');
var router = express.Router();

var mongo = require('mongodb');
var mongoDebug = require('node-mongodb-debug-log');
mongoDebug.install(mongo);

var sha1 = require('sha1');

var MongoClient = require('mongodb').MongoClient;

var url = process.env.MONGO_URL;
var dbName = process.env.DB_SCHEMA;

var EVENTS = 'events';

var db;

MongoClient.connect(url, function (err, database) {
    if (err) return console.log(err);
    db = database.db(dbName);
});

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
        db.collection(EVENTS).find({}, {
            projection: {
                _id: 0,
                description: 1,
                start_time: 1,
                end_time: 1,
                name: 1,
                id: 1,
                place:1,
                event_times : 1
            }
        }).toArray().then(function (value) {
            console.log(value);
            res.json(value)
        })
    });
});


module.exports = router;