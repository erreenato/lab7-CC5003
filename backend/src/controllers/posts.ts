import express from "express";
import PostModel from "../models/posts";
import User from "../models/user";
import { withOptionalUser } from "../utils/middleware";

const router = express.Router();

router.get("/threads", async (request, response) => {
  const threads = await PostModel.find({ thread: null });
  response.json(threads);
});

router.get("/threads/:id", async (request, response) => {
  const id = request.params.id;
  const [thread, comments] = await Promise.all([
    PostModel.findById(id),
    PostModel.find({ thread: id }),
  ]);

  if (!thread) {
    response.status(404).end();
    return;
  }
  if (thread.thread !== null) {
    response.status(400).json({ error: "Not a thread" });
    return;
  }
  response.json({ thread, comments });
});

// P5: Usamos withOptionalUser y determinamos el autor según la sesión
router.post("/threads", withOptionalUser, async (request, response, next) => {
  try {
    const { content, author } = request.body;
    let postAuthor: string;
    let userId: string | undefined = undefined;

    if (request.userId) {
      // Con sesión: buscamos al usuario para obtener su username e id
      const currentUser = await User.findById(request.userId);
      if (!currentUser) {
        response.status(401).json({ error: "user not found" });
        return;
      }
      postAuthor = currentUser.username; // Ignora el author del cuerpo
      userId = currentUser._id.toString();
    } else {
      // Sin sesión: usamos el author enviado o "Anónimo"
      postAuthor = author && author.trim() !== "" ? author : "Anónimo";
    }

    const post = new PostModel({
      content,
      author: postAuthor,
      thread: null,
      user: userId,
    });

    const savedPost = await post.save();
    response.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
});

// P5: Usamos withOptionalUser y determinamos el autor según la sesión
router.post("/threads/:id", withOptionalUser, async (request, response, next) => {
  try {
    const { content, author, parent } = request.body;
    let postAuthor: string;
    let userId: string | undefined = undefined;

    if (request.userId) {
      const currentUser = await User.findById(request.userId);
      if (!currentUser) {
        response.status(401).json({ error: "user not found" });
        return;
      }
      postAuthor = currentUser.username;
      userId = currentUser._id.toString();
    } else {
      postAuthor = author && author.trim() !== "" ? author : "Anónimo";
    }

    const post = new PostModel({
      content,
      author: postAuthor,
      thread: request.params.id,
      parent: parent || null,
      user: userId,
    });

    const savedPost = await post.save();
    response.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
});

router.put("/posts/:id", async (request, response) => {
  const updatedPost = await PostModel.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true }
  );

  if (!updatedPost) {
    response.status(404).end();
    return;
  }
  response.json(updatedPost);
});

export default router;