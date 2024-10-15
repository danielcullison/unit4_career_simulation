const client = require("./client.js");
const { createUser } = require("./users.js");
const { createItem } = require("./items.js");
const { createReview } = require("./reviews.js");
const { createComment } = require("./comments.js");

const dropTables = async () => {
  try {
    await client.query(`
        DROP TABLE IF EXISTS comments;
        DROP TABLE IF EXISTS reviews;
        DROP TABLE IF EXISTS items;
        DROP TABLE IF EXISTS users;
    `);
    console.log("Tables successfully dropped.");
  } catch (err) {
    console.log("ERROR DROPPING TABLES: ", err);
  }
};

const createTables = async () => {
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            average_rating FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            text TEXT,
            score INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER REFERENCES users(id),
            item_id INTEGER REFERENCES items(id)
            );

            CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER REFERENCES users(id),
            review_id INTEGER REFERENCES reviews(id)
            );
            
            `);
    console.log("Tables successfully created.");
  } catch (err) {
    console.log("ERROR CREATING TABLES: ", err);
  }
};

const init = async () => {
  await client.connect();

  await dropTables();

  await createTables();

  const jimmy = await createUser(
    "JimmyNeutron17",
    "jneutron17@gmail.com",
    "jneutron123"
  );

  const jayden = await createUser(
    "JaydenDaniels14",
    "jdaniels14@gmail.com",
    "jdaniels123"
  );

  const lance = await createUser(
    "LanceBerkman17",
    "lberkman17@gmail.com",
    "lberkman123"
  );

  const daniel = await createUser(
    "DanielCullison504",
    "dcullison504@gmail.com",
    "dcullison123"
  );

  const macie = await createUser(
    "MacieMatherne504",
    "mmatherne504@gmail.com",
    "mmatherne123"
  );

  const redBeans = await createItem(
    "Red Beans & Rice",
    "A New Orleans favorite served with a side of our world famous jalepeno cord bread!",
    4.1
  );

  const shrimpAlfredo = await createItem(
    "Shrimp Alfredo",
    "A creole special seasoned with none other than Zatarain's Famous Seasoning!",
    3.9
  );

  const catfishPoboy = await createItem(
    "Catfish Poboy",
    "Our famous thin-fried catfish poboy served w/ fries and coleslaw",
    4.0
  );

  const jambalaya = await createItem(
    "Jambalaya",
    "Our world famous jambalaya will make your taste buds water!",
    4.3
  );

  const gumbo = await createItem(
    "Gumbo",
    "Chicken andouille gumbo served on a bed of white rice.",
    4.8
  );

  await createReview("Best meal ever!", 5, jimmy.id, redBeans.id);

  await createReview("AWESOME", 5, jayden.id, shrimpAlfredo.id);

  await createReview("AMAZING!!!", 5, lance.id, catfishPoboy.id);

  await createReview("CANT WAIT TO COME BACK!", 4, daniel.id, jambalaya.id);

  await createReview("MUST TRY!!!!", 5, macie.id, gumbo.id);

  await createComment("Really?????", jimmy.id, shrimpAlfredo.id);

  await createComment("Cant wait to try this", jayden.id, catfishPoboy.id);

  await createComment("AGREED", lance.id, jambalaya.id);

  await createComment("RIGHT THERE WITH YOU", daniel.id, gumbo.id);

  await createComment(
    "I WILL MOST DEFINITELY BE TRYING THIS",
    macie.id,
    redBeans.id
  );
};

init();
