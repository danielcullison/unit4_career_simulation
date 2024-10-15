const client = require("./client.js");

const createComment = async (commentText, commentUserId, commentReviewId) => {
  if (!commentText || !commentUserId || !commentReviewId) {
    throw new Error(
      "Invalid input: commentText, commentUserId, and commentReviewId are required."
    );
  }

  try {
    const { rows } = await client.query(
      `
        INSERT INTO comments (text, user_id, review_id)
        VALUES ($1, $2, $3)
        RETURNING *;
      `,
      [commentText, commentUserId, commentReviewId]
    );

    return { success: true, comment: rows[0] };
  } catch (err) {
    console.error("ERROR CREATING COMMENT: ", err);
    throw new Error("Failed to create comment");
  }
};

const getComments = async (userId) => {
  if (!userId) {
    throw new Error("Invalid input: userId is required.");
  }

  try {
    const { rows } = await client.query(
      `SELECT * FROM comments WHERE user_id = $1;`,
      [userId]
    );
    return { success: true, comments: rows };
  } catch (err) {
    console.error("ERROR FETCHING COMMENTS: ", err);
    throw new Error("Failed to fetch comments");
  }
};

const deleteComment = async (commentId, userId) => {
  if (!commentId || !userId) {
    throw new Error("Invalid input: commentId and userId are required.");
  }

  try {
    const { rowCount } = await client.query(
      `DELETE FROM comments WHERE id = $1 AND user_id = $2;`,
      [commentId, userId]
    );
    if (rowCount === 0) {
      throw new Error("Comment not found or not authorized to delete");
    }
    return { success: true, message: "Comment deleted successfully" };
  } catch (err) {
    console.error("ERROR DELETING COMMENT: ", err);
    throw new Error("Failed to delete comment");
  }
};

module.exports = {
  createComment,
  getComments,
  deleteComment,
};
