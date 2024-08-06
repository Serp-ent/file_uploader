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
  });

module.exports = fileRouter;