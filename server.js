const express = require("express");
const app = express();
const client = require("./db/client.js");
client.connect();

app.use(express.json());

const { getItems, getSingleItem } = require("./db/items.js");
const { createReview, getReviews, deleteReview } = require("./db/reviews.js");
const {
  createComment,
  getComments,
  deleteComment,
} = require("./db/comments.js");
const {
  createUser,
  findUserWithToken,
  authenticate,
} = require("./db/users.js");

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }
    req.user = await findUserWithToken(token);
    next();
  } catch (ex) {
    next(ex);
  }
};

const checkUserAuthorization = (req, res, next) => {
  if (req.params.user_id !== req.user.id) {
    return res.status(401).json({ error: "not authorized" });
  }
  next();
};

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

app.get("/", (req, res) => {
  res.send("CALLIOPE REVIEW SITE");
});

app.get("/api/v1/items", async (req, res) => {
  try {
    const items = await getItems();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

app.get("/api/v1/items/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await getSingleItem(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const newUser = await createUser(username, email, password);
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const tokenResponse = await authenticate(req.body);
    res.json(tokenResponse);
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth/me", isLoggedIn, (req, res) => {
  res.json(req.user);
});

app.get(
  "/api/v1/users/:id/reviews",
  isLoggedIn,
  checkUserAuthorization,
  async (req, res) => {
    try {
      const reviews = await getReviews(req.params.id);
      res.json(reviews);
    } catch (ex) {
      next(ex);
    }
  }
);

app.post(
  "/api/v1/users/:id/reviews",
  isLoggedIn,
  checkUserAuthorization,
  async (req, res) => {
    try {
      const review = await createReview({
        user_id: req.params.id,
        item_id: req.body.item_id,
      });
      res.status(201).json(review);
    } catch (ex) {
      next(ex);
    }
  }
);

app.delete(
  "/api/v1/users/:user_id/reviews/:id",
  isLoggedIn,
  checkUserAuthorization,
  async (req, res) => {
    try {
      await deleteReview({ user_id: req.params.user_id, id: req.params.id });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);

app.get(
  "/api/v1/users/:user_id/comments",
  isLoggedIn,
  checkUserAuthorization,
  async (req, res) => {
    try {
      const comments = await getComments(req.params.user_id);
      res.json(comments);
    } catch (ex) {
      next(ex);
    }
  }
);

app.post(
  "/api/v1/users/:user_id/reviews/:review_id/comments",
  isLoggedIn,
  checkUserAuthorization,
  async (req, res) => {
    try {
      const comment = await createComment({
        user_id: req.params.user_id,
        review_id: req.params.review_id,
        content: req.body.content,
      });
      res.status(201).json(comment);
    } catch (ex) {
      next(ex);
    }
  }
);

app.delete(
  "/api/v1/users/:user_id/comments/:id",
  isLoggedIn,
  checkUserAuthorization,
  async (req, res) => {
    try {
      await deleteComment({ user_id: req.params.user_id, id: req.params.id });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = app;
