var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;

var client = new Client();

/**
 * @swagger
 * definitions:
 *   Hukamnama:
 *     type: object
 *     properties:
 *       eng:
 *         type: array
 *         items:
 *           type: string
 *       pbi:
 *         type: array
 *         items:
 *           type: string
 */

/**
 * @swagger
 * /hukamnama/today:
 *    get:
 *     description: Returns today's hukamnama
 *     produces:
 *       - application/json
 *     responses:
 *          200:
 *              description: Hukamnama for the given date
 *              schema:
 *                  $ref: '#/definitions/Hukamnama'
 *
 */
router.get('/today', function (req, res, next) {
    client.get("https://api.gurbaninow.com/v2/hukamnama/today", function (data, response) {

        var pbiText = new Array(), engText = new Array();

        for (var index in data.hukamnama) {
            var line = data.hukamnama[index].line;
            pbiText.push(line.gurmukhi.unicode);
            engText.push(line.translation.english.default);
        }

        var responseData = [{"eng": engText, "pbi": pbiText}];

        console.log(responseData)
        res.json(responseData);
    });
});

/**
 * @swagger
 * /hukamnama/today-v2:
 *    get:
 *     description: Returns today's hukamnama
 *     produces:
 *       - application/json
 *     responses:
 *          200:
 *              description: Hukamnama for the given date
 *              schema:
 *                  $ref: '#/definitions/Hukamnama'
 *
 */
router.get('/today-v2', function (req, res, next) {
    client.get("https://api.gurbaninow.com/v2/hukamnama/today", function (data, response) {

        var pbiText = new Array(), engText = new Array();

        for (var index in data.hukamnama) {
            var line = data.hukamnama[index].line;
            pbiText.push(line.gurmukhi.unicode);
            engText.push(line.translation.english.default);
        }

        var engDate = data.date.gregorian;
        var nanakshahi = data.date.nanakshahi.punjabi;

        var dateInfo = {"eng" : ''.concat(engDate.month,' ', engDate.date, ' ',engDate.year)
                        ,"pbi" :  ''.concat(nanakshahi.date, ' ', nanakshahi.month, ' ', nanakshahi.year)};

        var responseData = [{"date": dateInfo, "eng": engText, "pbi": pbiText}];

        console.log(responseData)
        res.json(responseData);
    });
});

/**
 * @swagger
 * /hukamnama/archived/{yyyy}/{mm}/{dd}:
 *   get:
 *     description: Returns users
 *     parameters:
 *          - name: yyyy
 *            description: year
 *            in: path
 *            required: true
 *            type: integer
 *          - name: mm
 *            description: month
 *            in: path
 *            required: true
 *            type: integer
 *          - name: dd
 *            description: day
 *            in: path
 *            required: true
 *            type: integer
 *     produces:
 *          - application/json
 *     responses:
 *          200:
 *              description: Hukamnama for the given date
 *              schema:
 *                  $ref: '#/definitions/Hukamnama'
 */
router.get('/archived/:yyyy/:mm/:dd', function (req, res, next) {
    var year = req.params.yyyy;
    var month = req.params.mm;
    var day = req.params.dd;

    var url = `https://api.gurbaninow.com/v2/hukamnama/${year}/${month}/${day}`;

    client.get(url, function (data, response) {

        var pbiText = new Array(), engText = new Array();

        for (var index in data.hukamnama) {
            var line = data.hukamnama[index].line;
            pbiText.push(line.gurmukhi.unicode);
            engText.push(line.translation.english.default);
        }

        var responseData = [{"eng": engText, "pbi": pbiText}];

        console.log(responseData)
        res.json(responseData);
    });
});

module.exports = router;