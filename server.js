const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { PORT, MONGO_URI } = require("./config");
const { UserModel } = require('./models');
const withAuth = require('./middleware');
const path = require('path');
const cors = require('cors');

const app = express();
const secret = 'mysecretsshhh';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

const mongo_uri = MONGO_URI;
mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true}, function(err) {
  if (err) {
    throw err;
  } else {
    console.log(`Successfully connected to ${mongo_uri}`);
  }
});

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/secret', withAuth, function(req, res) {
  res.send('The password is potato');
});

app.post('/api/register', function(req, res) {
    const { apellidos, nombres, username, email, password, cellphone } = req.body;
    const user = new UserModel({ apellidos, nombres, username, email, password, cellphone });
    user.save(function(err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error registering new user please try again.");
      } else {
        res.status(200).send("Welcome to the club!");
      }
    });
  });

  app.post('/api/authenticate', function(req, res) {
    const { username, password } = req.body;
    UserModel.findOne({ username }, function(err, user) {
      if (err) {
        console.error(err);
        res.status(500)
          .json({
          error: 'Internal error please try again'
        });
      } else if (!user) {
        res.status(401)
          .json({
          error: 'Incorrect email or password'
        });
      } else {
        user.isCorrectPassword(password, function(err, same) {
          if (err) {
            res.status(500)
              .json({
              error: 'Internal error please try again'
            });
          } else if (!same) {
            res.status(401)
              .json({
              error: 'Incorrect email or password'
            });
          } else {
            // Issue token
            const payload = { username };
            const token = jwt.sign(payload, secret, {
              expiresIn: '1h'
            });
            res.cookie('token', token, { httpOnly: true }).sendStatus(200);
          }
        });
      }
    });
  });

  app.get('/checkToken', withAuth, function(req, res) {
    res.sendStatus(200);
  });

  app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT);
