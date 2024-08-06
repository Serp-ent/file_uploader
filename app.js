const express = require('express');
const usersRoute = require('./routes/usersRoute');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');

const prisma = require('./db/prismaClient');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  store: new PrismaSessionStore(prisma,
    {
      checkPeriod: 2 * 60 * 1000,  //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }
  ),

}))
app.use(passport.session());

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      });

      if (!user) {
        return done(null, false, { message: "Incorrect credentials" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect credentials" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
})

app.use('/', usersRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Express app listening on port', PORT);
})