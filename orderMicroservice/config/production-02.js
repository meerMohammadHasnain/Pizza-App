// Dependencies
import 'dotenv/config';
import path from 'path';

/*
require('dotenv').config();
const path = require('path');
*/

// Export the configuration object
export var config = {
  'httpPort' : 2002,
  'httpsPort' : 2003,
  'consulInfo' : {
    'registeredServiceIdHttp' : 'order_microservice_HTTP_02',
    'registeredServiceIdHttps' : 'order_microservice_HTTPS_02'
  },
  'logFileName' : path.join(__dirname, "/../.logs/order_microservice02.log"),
};
