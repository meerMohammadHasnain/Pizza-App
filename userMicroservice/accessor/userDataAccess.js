/*
*
* Deals with data access from the database
*
*/

// Dependencies
import mongoose from 'mongoose';
import {config} from 'config';
import url from 'url';
import Model from './../schema/userSchema';
import logger from './../util/logger';

// Constants
const CONNECT_TIMEOUT_MS = 1000;
const SOCKET_TIMEOUT_MS = 1000;

// Container function for accessor methods
var UserDataAccess = function() {
  this.connectionUrl = url.format({
    'protocol' : config.mongodbInfo.protocol,
    'hostname' : config.mongodbInfo.host,
    'port' : config.mongodbInfo.port,
    'pathname' : config.mongodbInfo.dbName,
    'slashes' : true
  });
};

// Connect to the database
UserDataAccess.prototype.connectDatabase = async function() {
  var response = await mongoose.connect(this.connectionUrl, {
    'useNewUrlParser' : true,
    'connectTimeoutMS' : CONNECT_TIMEOUT_MS,
    'socketTimeoutMS' : SOCKET_TIMEOUT_MS
  }).catch(err => {
    throw err;
  });
  return;
};

// Create a user
UserDataAccess.prototype.createUser = async function(userData) {
  var document = new Model(userData);
  var response = await document.save()
        .catch(err => {
          mongoose.connection.close();
          throw err;
        });
  mongoose.connection.close();
  return response;
};

// Get a user
UserDataAccess.prototype.getUser = async function(filter) {
  var response = await Model.findOne(filter)
     .catch(err => {
       mongoose.connection.close();
       throw err;
     });
  mongoose.connection.close();
  return response;
};

// Update a user
UserDataAccess.prototype.updateUser = async function(filter, userData) {
  var response = await Model.updateOne(filter, userData)
        .catch(err => {
          mongoose.connection.close();
          throw err;
        });
  mongoose.connection.close();
  return response;
};

// Delete a user
UserDataAccess.prototype.deleteUser = async function(filter) {
  var response = await Model.deleteOne(filter)
        .catch(err => {
          mongoose.connection.close();
          throw err;
        });
  mongoose.connection.close();
  return response;
};

// Export the module
export default new UserDataAccess();
