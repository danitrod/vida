export default {
  mongodb: {
    url: process.env.MONGODB_URI,

    databaseName: "vida-blog",

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
    },
  },

  migrationsDir: "migrations",

  changelogCollectionName: "changelog",

  lockCollectionName: "changelog_lock",

  lockTtl: 0,

  migrationFileExtension: ".ts",

  useFileHash: false,

  moduleSystem: "commonjs",
};
