const { Router } = require('express');
const multer = require('multer');
const upload = multer({ dest: "uploads/" });

const fileRouter = Router();

fileRouter.post('/upload',
  upload.single('file'),
  (req, res) => {
    console.dir(JSON.stringify(req.body));
    console.log();
    console.log(req.file);

    res.redirect('/');
  });

module.exports = fileRouter;