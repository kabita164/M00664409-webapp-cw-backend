const { MongoClient, ServerApiVersion } = require("mongodb");
const path = require("node:path");
const propertiesReader = require("properties-reader");

let propertiesPath = path.resolve(__dirname, "conf/db.properties");
let properties = propertiesReader(propertiesPath);
let dbPrefix = properties.get("db.prefix");
// URL-Encoding for User and PWD for potential special characters
let dbUsername = encodeURIComponent(properties.get("db.user"));
let dbPwd = encodeURIComponent(properties.get("db.pwd"));
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");
const uri = dbPrefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;

let dbConnection;

module.exports = {
  connectToDatabase: (callback) => {
    MongoClient.connect(uri)
      .then((client) => {
        dbConnection = client.db(dbName);
        // run provided callback function after connected
        return callback();
      })
      .catch((err) => {
        console.log(err);
        return callback(err);
      });
  },
  getDatabase: () => dbConnection,
};
