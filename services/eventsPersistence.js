var mongo = require('mongodb');
var mongoDebug = require('node-mongodb-debug-log');
mongoDebug.install(mongo);

var sha1 = require('sha1');
var clone = require('clone');

var MongoClient = require('mongodb').MongoClient;

var url = process.env.MONGO_URL;
var dbName = process.env.DB_SCHEMA;

var EVENTS_METADATA = 'eventsMetadata';
var EVENTS = 'events';

var db;

MongoClient.connect(url, function (err, database) {
    if (err) return console.log(err);
    db = database.db(dbName);
});

function calculateHash(events) {
    return new Promise(function (resolve, reject) {
        var hash = sha1(events);
        resolve({'events': events, 'hash': hash});
    });
}

function updateEventsIfHashChanged(events, currentHash) {
    return new Promise(function (resolve, reject) {

        db.collection(EVENTS_METADATA).findOne()
            .then(function (result) {
                var previousHash = result ? result.value : '';
                return new Promise(function (resolve, reject) {
                        if (!(previousHash === currentHash)) {
                            console.log('Hash changed. New events added.')
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    }
                )
            })
            .then(function (value) {

                if (value) {
                    insertEvents(events)
                        .then(function (count) {
                            resolve({'hashChanged': value, 'currentHash': currentHash});
                        })
                        .catch(function (reason) {
                            reject(reason)
                        })
                }
            })
            .catch(function (reason) {
                reject(reason);
            })
    });
}

function insertEvents(events) {
    return new Promise(function (resolve, reject) {

        var normalizedEvents = new Array()

        for (itemIndex in events) {
            var event = events[itemIndex]

            // If the event is recurring
            if (event.event_times) {
                var eventTimes = event.event_times;

                delete event['event_times'];

                for (e in eventTimes) {
                    var et = eventTimes[e];

                    var recEvent = clone(event);
                    recEvent['start_time'] = et['start_time'];
                    recEvent['end_time'] = et['end_time'];
                    recEvent['id'] = et['id'];

                    normalizedEvents.push(recEvent)
                }
            }

        }
        //TODO Refactor
        db.collection(EVENTS).remove({});
        db.collection(EVENTS).insertMany(normalizedEvents)
            .then(function (result) {
                console.log('Inserted', result.insertedCount, 'records')
                resolve(result.insertedCount)
            })
            .catch(function (reason) {
                reject(reason)
            });
    });
}

function updateHashInDb(hashChanged, newHash) {
    if (hashChanged) {
        //TODO Refactor
        db.collection(EVENTS_METADATA).remove({});
        db.collection(EVENTS_METADATA).insertOne({'value': newHash})
            .then(function (value) {
                console.log('Updated hash in the events metadata.')
            })
            .catch(function (reason) {
                console.error(reason)
            })
    }
}

function storeEvents(events) {
    calculateHash(events)
        .then(function (context) {
            return updateEventsIfHashChanged(events, context.hash);
        })
        .then(function (context) {
            return updateHashInDb(context.hashChanged, context.currentHash)
        })
        .catch(function (reason) {
            console.error(reason);
        });
}

module.exports = {storeEvents};