const passport = require('passport');
const bcrypt = require('bcryptjs');
const prisma = require('../db/prismaClient');

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
        files: {
          create: {
            name: 'root',
            type: 'FOLDER',
          }
        }
      }
    });

    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(400).send('User already exists');
  }
}

const homePageGet = async (req, res) => {
  res.locals.files = null;
  if (req.user) {

    const rootFolder = await prisma.file.findFirst({
      where: {
        userId: req.user.id,
        type: "FOLDER",
        parentId: null,
      }
    });

    res.locals.files = await prisma.file.findMany({
      where: {
        parentId: rootFolder.id,
      }
    });
  }

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