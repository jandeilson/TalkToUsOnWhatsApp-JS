// BASE SETUP
// =============================================================================

// packages
import path from 'path'
import express from 'express'
import webpack from 'webpack'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config from '../../webpack.dev.config.js'

const app = express(),
    compiler = webpack(config)


// configure app
app.use(morgan('dev')); // log requests to the console

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
}));

app.use(webpackHotMiddleware(compiler))

// configure body parser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var port = process.env.PORT || 9090; // set our port

// database setup
var mongoose = require('mongoose');
mongoose.connect('mongodb://mobilizze:N842EkhQx37s8DQ@mobilizzecluster-shard-00-00-zeoup.mongodb.net:27017,mobilizzecluster-shard-00-01-zeoup.mongodb.net:27017,mobilizzecluster-shard-00-02-zeoup.mongodb.net:27017/TalkToUsOnWhatsApp?ssl=true&replicaSet=MobilizzeCluster-shard-0&authSource=admin&retryWrites=true'); // connect to our database

// Handle the connection event
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    console.log("DB connection alive");
});

// Client models lives here
var Client = require('./models/client');

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/talktousonwhatsapp)
router.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// on routes that end in /clients
// ----------------------------------------------------
router.route('/clients')

    // create a client (accessed at POST http://localhost:8080/clients)
    .post(function (req, res) {

        var client = new Client(); // create a new instance of the Client model
        client.name = req.body.name; // set the clients name (comes from the request)

        client.save(function (err) {
            if (err)
                res.send(err);

            res.json({
                message: 'Client created!'
            });
        });


    })

    // get all the clients (accessed at GET http://localhost:8080/talktousonwhatsapp/clients)
    .get(function (req, res) {
        Client.find(function (err, clients) {
            if (err)
                res.send(err);

            res.json(clients);
        });
    });

// on routes that end in /client/:client_id
// ----------------------------------------------------
router.route('/client/:client_id')

    // get the client with that id
    .get(function (req, res) {
        Client.findById(req.params.client_id, function (err, client) {
            if (err)
                res.send(err);
            res.json(client);
        });
    })

    // update the client with this id
    .put(function (req, res) {
        Client.findById(req.params.client_id, function (err, client) {

            if (err)
                res.send(err);

            client.name = req.body.name;
            client.save(function (err) {
                if (err)
                    res.send(err);

                res.json({
                    message: 'Client updated!'
                });
            });

        });
    })

    // delete the client with this id
    .delete(function (req, res) {
        Client.remove({
            _id: req.params.client_id
        }, function (err, client) {
            if (err)
                res.send(err);

            res.json({
                message: 'Successfully deleted'
            });
        });
    });


// REGISTER OUR ROUTES -------------------------------
app.use('/talktousonwhatsapp', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);