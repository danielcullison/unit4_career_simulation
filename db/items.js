const client = require("./client.js");

const createItem = async (itemName, itemDescription, itemAverageRating) => {
  if (!itemName) {
    throw new Error("Invalid input: itemName is required.");
  }

  try {
    const { rows } = await client.query(
      `
        INSERT INTO items (name, description, average_rating)
        VALUES ($1, $2, $3)
        RETURNING *;
      `,
      [itemName, itemDescription, itemAverageRating]
    );
    return { success: true, item: rows[0] };
  } catch (err) {
    console.error("ERROR CREATING ITEM: ", err);
    throw new Error("Failed to create item");
  }
};

const getItems = async () => {
  try {
    const { rows } = await client.query(`
            SELECT * FROM items;
            `);
    return { success: true, items: rows };
  } catch (err) {
    console.error("ERROR FETCHING ITEMS: ", err);
    throw new Error("Failed to fetch items");
  }
};

const getSingleItem = async (itemId) => {
  if (!itemId) {
    throw new Error("Invalid input: itemId is required.");
  }

  try {
    const { rows } = await client.query(
      `
            SELECT * FROM items
            WHERE id = $1;
            `,
      [itemId]
    );

    if (rows.length === 0) {
      throw new Error("Item not found");
    }

    return { success: true, item: rows[0] };
  } catch (err) {
    console.error("ERROR FETCHING ITEM: ", err);
    throw new Error("Failed to fetch item");
  }
};

module.exports = {
  createItem,
  getItems,
  getSingleItem,
};
