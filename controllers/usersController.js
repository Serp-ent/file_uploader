const { PrismaClient } = require('@prisma/client');
const passport = require('passport');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const createUserGet = (req, res) => {
  res.render('signup');
}

// TODO: add more fields for email, first name, last name,
// TODO: add validation
const createUserPost = async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      }
    });

    res.redirect('/');
  } catch (error) {
    res.status(400).send('User already exists');
  }
}

const homePageGet = (req, res) => {
  res.render('index');
}

const loginGet = (req, res) => {
  res.render('login');
}

const loginPost = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
})

const logoutPost = (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }

    res.redirect('/');
  });
}


module.exports = {
  createUserGet,
  createUserPost,

  loginGet,
  loginPost,

  logoutPost,

  homePageGet,
}