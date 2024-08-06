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

fileRouter.post("/folder/:id/createFolder", async (req, res) => {
  const folderName = req.body.folderName;
  const result = await prisma.file.create({
    data: {
      name: folderName,
      type: "FOLDER",
      parentId: Number(req.params.id),
      userId: req.user.id,
    }
  });

  // stay in the same folder
  res.redirect(`/files/folder/${req.params.id}`);
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

  res.render('index', { directory });
})

fileRouter.post('/folder/:id',
  upload.single('file'),
  async (req, res) => {
    const userId = req.user.id;

    const directory = await prisma.file.findFirst({
      where: {
        id: Number(req.params.id),
        userId: userId,
        type: "FOLDER",
      }
    });
    console.log(directory);

    const newItem = await prisma.file.create({
      data: {
        name: req.file.originalname,
        userId,
        parentId: directory.id,
        path: req.file.path,
        type: "FILE"
      }
    });

    res.redirect(`/files/folder/${req.params.id}`);
  }
);

module.exports = fileRouter;