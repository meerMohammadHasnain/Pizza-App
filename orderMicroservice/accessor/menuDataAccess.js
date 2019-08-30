/*
*
* Deals with data access from the database
*
*/

// Dependencies
import mongoose from 'mongoose';
import {config} from 'config';
import url from 'url';
import Model from './../schema/menuSchema';
import logger from './../util/logger';

// Constants
const CONNECT_TIMEOUT_MS = 1000;
const SOCKET_TIMEOUT_MS = 1000;

// Container function for accessor methods
var MenuDataAccess = function() {
  this.connectionUrl = url.format({
    'protocol' : config.mongodbInfo.protocol,
    'hostname' : config.mongodbInfo.host,
    'port' : config.mongodbInfo.port,
    'pathname' : config.mongodbInfo.dbName,
    'slashes' : true
  });
};

// Connect to the database
MenuDataAccess.prototype.connectDatabase = async function() {
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

// Close database connection
MenuDataAccess.prototype.closeDatabase = async function() {
  mongoose.connection.close();
};

// Get menu items
MenuDataAccess.prototype.getMenuItems = async function(filter, projection, sortOrder, pageSize) {
  var response = await Model.find(filter, projection).sort(sortOrder).limit(pageSize)
     .catch(err => {
       mongoose.connection.close();
       throw err;
     });
  return response;
};

// Get menu item by id
MenuDataAccess.prototype.getMenuItemById = async function(filter) {
  var response = await Model.findOne(filter)
     .catch(err => {
       mongoose.connection.close();
       throw err;
     });
  return response;
};

// Export the module
export default new MenuDataAccess();
