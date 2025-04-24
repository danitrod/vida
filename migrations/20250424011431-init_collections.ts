module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    await db.createCollection("users");
    await db.createCollection("posts");
    await db.createCollection("comments");
    await db.createCollection("reactions");
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db) {
    await db.collection("reactions").drop();
    await db.collection("comments").drop();
    await db.collection("posts").drop();
    await db.collection("users").drop();
  },
};
