const constants = require('./constants');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const knexDb = require('../data/knexDb');

const sessionConfig = {
  name: 'lkjsdf@#(%x',
  secret: constants.sessionSecret,
  cookie: {
    maxAge: 1000 * 60 * 10, //10 minutes
    secure: constants.cookieSecure,
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: true,
  store: new KnexSessionStore({
    knex: knexDb,
    tablename: 'sessions',
    sidfieldname: 'sid',
    createtable: true,
    clearInterval: 1000 * 60 * 60
  })
};

module.exports = {sessionConfig, session};
