// Dependencies
import 'dotenv/config';
import path from 'path';

/*
require('dotenv').config();
const path = require('path');
*/

// Export the configuration object
export var config = {
 'host' : '127.0.0.1',
 'httpPort' : 2008,
 'httpsPort' : 2009,
 'mongodbInfo' : {
   'host' : '127.0.0.1',
   'port' : 27017
 },
 'consulInfo' : {
   'consulHost' : '127.0.0.1',
   'consulPort' : 8500
 },
 'keyFileLocation' : path.join(__dirname, "/../https/key.pem"),
 'certFileLocation' : path.join(__dirname, "/../https/cert.pem"),
 'logFileName' : path.join(__dirname, "/../.logs/order_microservice.log")
};
