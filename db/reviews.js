const client = require("./client.js");

const createReview = async (
  reviewText,
  reviewScore,
  reviewUserId,
  reviewItemId
) => {
  if (
    !reviewText ||
    typeof reviewScore !== "number" ||
    !reviewUserId ||
    !reviewItemId
  ) {
    throw new Error(
      "Invalid input: reviewText, reviewScore (number), reviewUserId, and reviewItemId are required."
    );
  }

  try {
    const { rows } = await client.query(
      `
      INSERT INTO reviews (text, score, user_id, item_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [reviewText, reviewScore, reviewUserId, reviewItemId]
    );

    return { success: true, review: rows[0] };
  } catch (err) {
    console.error("ERROR CREATING REVIEW: ", err);
    throw new Error("Failed to create review");
  }
};

const getReviews = async (userId) => {
  if (!userId) {
    throw new Error("Invalid input: userId is required.");
  }

  try {
    const { rows } = await client.query(
      `SELECT * FROM reviews WHERE user_id = $1;`,
      [userId]
    );
    return { success: true, reviews: rows };
  } catch (err) {
    console.error("ERROR FETCHING REVIEWS: ", err);
    throw new Error("Failed to fetch reviews");
  }
};

const deleteReview = async (reviewId, userId) => {
  if (!reviewId || !userId) {
    throw new Error("Invalid input: reviewId and userId are required.");
  }

  try {
    const { rowCount } = await client.query(
      `DELETE FROM reviews WHERE id = $1 AND user_id = $2;`,
      [reviewId, userId]
    );

    if (rowCount === 0) {
      throw new Error(
        `Review with ID ${reviewId} not found or not authorized to delete`
      );
    }

    return { success: true, message: "Review deleted successfully" };
  } catch (err) {
    console.error("ERROR DELETING REVIEW: ", err);
    throw new Error("Failed to delete review");
  }
};

module.exports = {
  createReview,
  getReviews,
  deleteReview,
};
