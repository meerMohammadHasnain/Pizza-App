// Dependencies
import 'dotenv/config';
import path from 'path';

/*
require('dotenv').config();
const path = require('path');
*/

// Export the configuration module
export var config = {
  'httpPort' : 2000,
  'httpsPort' : 2001,
  'consulInfo' : {
    'registeredServiceIdHttp' : 'order_microservice_HTTP_01',
    'registeredServiceIdHttps' : 'order_microservice_HTTPS_01'
  },
  'logFileName' : path.join(__dirname, "/../.logs/order_microservice01.log"),
};
