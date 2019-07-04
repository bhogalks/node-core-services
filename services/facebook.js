/*  Component used to access the facebook graph api.  */

var Client = require('node-rest-client-promise').Client;
var client = new Client();


module.exports = {getEvents};

/**
 * Returns the public facebook events for the given pageId
 * @param pageId
 * @param appId
 * @param appSecret
 */
function getEvents(pageId, appId, appSecret) {
    var longTermAccessTokenAvailable = process.env.FB_LONG_TERM_ACCESS_TOKEN;

    if (longTermAccessTokenAvailable != undefined) {
        return new Promise(function (resolve, reject) {
            getFacebookEvents(pageId, longTermAccessTokenAvailable)
                .then(function (events) {
                    resolve(events);
                })
                .catch(function (reason) {
                    reject(reason);
                });
        });
    } else {
        return new Promise(function (resolve, reject) {
            accessToken(appId, appSecret)
                .then(function (value) {
                    return getFacebookEvents(pageId, value)
                })
                .then(function (events) {
                    resolve(events);
                })
                .catch(function (reason) {
                    reject(reason);
                });
        });
    }
}

/**
 * Gets the public events from the facebook page
 * @param accessToken
 */
function getFacebookEvents(pageId, accessToken) {
    return new Promise(function (resolve, reject) {

        var eventsUrl = `https://graph.facebook.com/v2.9/${pageId}/events?access_token=${accessToken}`;

        client.getPromise(eventsUrl)
            .then(function (result) {
                var response = result.response;
                var data = result.data;

                if (response.statusCode == 200) {
                    var events = JSON.parse(data.toString());
                    resolve(events.data)
                } else {
                    reject(reject(createError(response.statusCode,response.statusMessage,data.toString())));
                }
            })
            .catch(function (reason) {
                reject(reason)
            });
    });
}

/**
 * Calls the faebooks graph api end point and gets the access token for the subsequent REST calls.
 * @param appId ID for the facebook user accessing the facebook information.
 * @param appSecret Secret/Password for the user.
 */
function accessToken(appId, appSecret) {
    return new Promise(function (resolve, reject) {

        var accessTokenUrl = `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`;

        client.getPromise(accessTokenUrl)
            .then(function (value) {

                var response = value.response
                var data = value.data

                if (response.statusCode == 200) {
                    resolve(data.access_token);
                } else {
                    reject(createError(response.statusCode,response.statusMessage,data.toString()));
                }
            })
            .catch(function (reason) {
                console.log('Error : ', reason)
            });
    });
}

/**
 * Returns the error message
 * @param code
 * @param message
 * @param data
 * @returns {{reason: {reason: *, message: *, data: *}}}
 */
function createError(code, message, data) {
    return {
        reason: {
            'reason': code,
            'message': message,
            'data': data
        }
    };
}