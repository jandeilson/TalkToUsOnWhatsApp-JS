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

// configure app
const app = express(),
  compiler = webpack(config)

app.use(webpackDevMiddleware(compiler, {
  noInfo: true,
  publicPath: '/'
}));

app.use(webpackHotMiddleware(compiler))

app.use('/admin', function (req, res, next) {
  var filename = path.join(compiler.outputPath, 'admin.html');
  compiler.outputFileSystem.readFile(filename, function (err, result) {
    if (err) {
      return next(err);
    }
    res.set('content-type', 'text/html');
    res.send(result);
    res.end();
  });
});

app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// database setup
const mongoose = require('mongoose');
mongoose.connect('mongodb://mobilizze:N842EkhQx37s8DQ@mobilizzecluster-shard-00-00-zeoup.mongodb.net:27017,mobilizzecluster-shard-00-01-zeoup.mongodb.net:27017,mobilizzecluster-shard-00-02-zeoup.mongodb.net:27017/TalkToUsOnWhatsApp?ssl=true&replicaSet=MobilizzeCluster-shard-0&authSource=admin&retryWrites=true'); // connect to our database

// Handle the connection event
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  console.log("DB connection alive");
});

// Client models lives here
const Client = require('../models/client');
//





// ROUTES FOR OUR API
// =============================================================================



// create router
const router = express.Router();

// middleware to use for all requests
router.use(function (req, res, next) {
  // do logging
  console.log('Something is happening.');
  next();
});

// test route to make sure everything is working (accessed at GET http://localhost:9000/api)
router.get('/', function (req, res) {
  res.json({
    message: 'Welcome to TalkToUsOnWhatsApp'
  });
});

/**
  app.get('/admin', function (req, res) {
  res.sendFile(__dirname + "/admin.html");
  });
*/

// on routes that end in /clients
// ----------------------------------------------------
router.route('/clients')

  // create a client (accessed at POST http://localhost:9000/clients)
  .post(function (req, res) {

    const client = new Client(); // create a new instance of the Client model
    client.name = req.body.name; // set the clients name (comes from the request)

    client.save(function (err) {
      if (err)
        res.send(err);

      res.json({
        message: 'Client created!'
      });
    });


  })

  // get all the clients (accessed at GET http://localhost:9000/api/clients)
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
//  


// register router
app.use('/api', router);





// START THE SERVER
// =============================================================================
const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`App listening to ${PORT}....`)
  console.log('Press Ctrl+C to quit.')
})
//