const { Router } = require('express');
const fs = require('fs');
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

fileRouter.post("/:id/delete", async (req, res) => {
  // remove that file
  const file = await prisma.file.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (!file) {
    return res.status(404).send('File not found');
  }

  // remove from db
  await prisma.file.delete({
    where: {
      id: file.id,
    },
  });

  if (file.type === 'FILE' && file.path) {
    // remove from filesystem
    fs.unlink(file.path, async (err) => {
      if (err) {
        return res.status(500).send('Error deleting the file', err);
      }
    });
  }

  res.redirect(`/files/folder/${file.parentId}`);
});

fileRouter.get("/:id/download", async (req, res) => {
  // remove that file
  const file = await prisma.file.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (!file) {
    return res.status(404).send('File not found');
  }

  console.log('sending file', file);
  console.log(file.path, "exist?", fs.existsSync(file.path));
  if (file.path && fs.existsSync(file.path)) {
    // Set the appropriate headers for downloading
    res.download(file.path, file.name, (err) => {
      if (err) {
        res.status(500).send('Error downloading the file');
      }
    });
  } else {
    res.status(404).send('File not found on the server');
  }

});

module.exports = fileRouter;