const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const { sessionConfig, session } = require('../config/sessionConfig');
const constants = require('../config/constants');
const usersDb = require('./usersModel');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(session(sessionConfig));

server.get('/', (req, res) => res.status(200).json({ message: "server up." }));
server.get('/api', (req, res) => res.status(200).json({ message: "api up." }));

server.post('/api/register', requireProperties(['username', 'password']), (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, constants.bcryptRounds);
  user.password = hash;

  usersDb.add(user)
    .then(newUser => {
      if (newUser) {
        res.status(201).json({ message: 'created', username: newUser.username });
      } else {
        res.status(400).json({ message: 'An account with that username already exists.' });
      }
    })
    .catch(error => {
      res.status(500).json({ message: error.message });
    });
});

server.post('/api/login', requireProperties(['username', 'password']), (req, res) => {
  const { username, password } = req.body;

  usersDb.findBy({ username })
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.loggedIn = true;
        req.session.username = user.username;
        res.status(200).json({ message: `Welcome ${username}.` });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    });
});

server.get('/api/users', restricted, (req, res) => {
  usersDb.find()
    .then(users => res.status(200).json(users))
    .catch(err => res.status(500).json({ message: 'There was an issue with the server.', error: err.message }));
});

//middleware

function requireProperties(keys) {
  return (req, res, next) => {
    const missing = [];
    keys.forEach(key => {
      if (!req.body.hasOwnProperty(key)) {
        missing.push(key);
      }
    });
    if (missing.length > 0) {
      res.status(400).json({ message: `Please include: ${missing.join(', ')}` });
    } else {
      next();
    }
  };
};

function restricted(req, res, next) {
  if (req.session && req.session.loggedIn) {
    next();
  } else {
    res.status(401).json({ message: 'Please log in.' });
  }
}

module.exports = server;