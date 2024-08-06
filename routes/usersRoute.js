const { Router } = require('express')
const controller = require('../controllers/usersController');
const usersRoute = Router();

// Make the user available in all templates
usersRoute.use((req, res, next) => {
  res.locals.user = req.user;
  next();
})

usersRoute.get('/signup', controller.createUserGet);
usersRoute.post('/signup', controller.createUserPost);

usersRoute.get('/login', controller.loginGet);
usersRoute.post('/login', controller.loginPost);

usersRoute.post('/logout', controller.logoutPost);

usersRoute.get('/', controller.homePageGet);

module.exports = usersRoute;