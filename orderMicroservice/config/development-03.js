// Dependencies
import 'dotenv/config';
import path from 'path';

/*
require('dotenv').config();
const path = require('path');
*/

// Export the configuration object
export var config = {
  'httpPort' : 2004,
  'httpsPort' : 2005,
  'consulInfo' : {
    'registeredServiceIdHttp' : 'order_microservice_HTTP_03',
    'registeredServiceIdHttps' : 'order_microservice_HTTPS_03'
  },
  'logFileName' : path.join(__dirname, "/../.logs/order_microservice03.log")
};
