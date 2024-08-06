const { Router } = require('express');
const multer = require('multer');
const prisma = require('../db/prismaClient');
const upload = multer({ dest: "uploads/" });

const fileRouter = Router();
// TODO: add authentication

fileRouter.post('/upload',
  upload.single('file'),
  async (req, res) => {
    const userId = req.user.id;

    const rootFolder = await prisma.file.findFirst({
      where: {
        userId: userId,
        type: "FOLDER",
        parentId: null,
      }
    });

    const newItem = await prisma.file.create({
      data: {
        name: req.file.originalname,
        userId,
        parentId: rootFolder.id,
        path: req.file.path,
        type: "FILE"
      }
    });

    res.redirect('/');
  }
);

fileRouter.post("/createFolder", async (req, res) => {
  const folderName = req.body.folderName;
  const rootFolder = await prisma.file.findFirst({
    where: {
      userId: req.user.id,
      type: "FOLDER",
      parentId: null,
    }
  });

  const result = await prisma.file.create({
    data: {
      name: folderName,
      type: "FOLDER",
      parentId: rootFolder.id,
      userId: req.user.id,
    }
  });

  console.log('directory', result.name, "created");

  // TODO: redirect user to display that folder
  res.redirect('/');
})

// TODO: handle root id
fileRouter.get('/folder', (req, res) => {

})
// TODO: authorize access to folders
fileRouter.get('/folder/:id', async (req, res) => {
  const directory = await prisma.file.findFirst({
    where: {
      id: Number(req.params.id),
      type: 'FOLDER',
    },
    include: {
      children: true,
    }
  });

  console.log(directory);
  res.render('index', { directory });
})

module.exports = fileRouter;