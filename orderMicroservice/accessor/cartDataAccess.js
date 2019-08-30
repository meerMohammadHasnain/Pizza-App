/*
*
* Deals with data access from the database
*
*/

// Dependencies
import mongoose from 'mongoose';
import {config} from 'config';
import url from 'url';
import Model from './../schema/cartSchema';
import logger from './../util/logger';

// Constants
const CONNECT_TIMEOUT_MS = 1000;
const SOCKET_TIMEOUT_MS = 1000;

// Container function for accessor methods
var CartDataAccess = function() {
  this.connectionUrl = url.format({
    'protocol' : config.mongodbInfo.protocol,
    'hostname' : config.mongodbInfo.host,
    'port' : config.mongodbInfo.port,
    'pathname' : config.mongodbInfo.dbName,
    'slashes' : true
  });
};

// Connect to the database
CartDataAccess.prototype.connectDatabase = async function() {
  var response = await mongoose.connect(this.connectionUrl, {
    'useNewUrlParser' : true,
    'useCreateIndex' : true,
    'connectTimeoutMS' : CONNECT_TIMEOUT_MS,
    'socketTimeoutMS' : SOCKET_TIMEOUT_MS
  }).catch(err => {
    throw err;
  });
  return;
};

// Close the database connection
CartDataAccess.prototype.closeDatabase = async function() {
  mongoose.connection.close();
};

// Create a cart
CartDataAccess.prototype.createCart = async function(cartData) {
  var document = new Model(cartData);
  var response = await document.save()
        .catch(err => {
          mongoose.connection.close();
          throw err;
        });
  return response;
};

// Get a cart
CartDataAccess.prototype.getCart = async function(filter) {
  var response = await Model.findOne(filter)
     .catch(err => {
       mongoose.connection.close();
       throw err;
     });
  return response;
};

// Get an array of carts that satisfy the condition mentioned in 'filter'
CartDataAccess.prototype.getCarts = async function(filter) {
  var response = await Model.find(filter)
     .catch(err => {
       mongoose.connection.close();
       throw err;
     });
  return response;
};

// Update a cart
CartDataAccess.prototype.updateCart = async function(filter, cartData) {
  var response = await Model.updateOne(filter, cartData)
        .catch(err => {
          mongoose.connection.close();
          throw err;
        });
  return response;
};

// Delete a cart
CartDataAccess.prototype.deleteCart = async function(filter) {
  var response = await Model.deleteOne(filter)
        .catch(err => {
          mongoose.connection.close();
          throw err;
        });
  return response;
};

// Delete all the carts of a user
CartDataAccess.prototype.deleteCarts = async function(filter) {
  var response = await Model.deleteMany(filter)
        .catch(err => {
          mongoose.connection.close();
          throw err;
        });
  return response;
};

// Export the module
export default new CartDataAccess();
