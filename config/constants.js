module.exports = {
  bcryptRounds: process.env.BCRYPT_ROUNDS || 12,
  cookieSecure: process.env.COOKIE_SECURE || false,
  sessionSecret: process.env.SESSION_SECRET || 'lksdf9S*D&F(3lkj(*S)DF#@%'
}