//Properties should be set manually in Prod
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

var express         = require('express');
var swaggerUi       = require('swagger-ui-express');
var path            = require('path');
var hukamnama       = require('./routes/hukamnama.js');
var swaggerJSDoc    = require('swagger-jsdoc');

var app = express();

//Public resources
app.use(express.static(path.join(__dirname, 'public')));

// Swagger config
var swaggerSpec = swaggerJSDoc({
    swaggerDefinition: {
        info: {
            title: 'Guru Nanak Darbar Gurdwara - Core services API',
            version: '1.0.0',
        },
    },
    apis: ['routes/*.js'],
    option:{},
    basePath:'/',
    host: process.env.HOST_NAME
});


// Routes
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/hukamnama', hukamnama);


//TODO configure error handlers

module.exports = app;
