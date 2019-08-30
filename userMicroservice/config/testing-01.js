// Dependencies
import 'dotenv/config';
import path from 'path';

// Export the configuration object
export var config = {
  'httpPort' : 1000,
  'httpsPort' : 1001,
  'consulInfo' : {
    'registeredServiceIdHttp' : 'user_microservice_HTTP_01',
    'registeredServiceIdHttps' : 'user_microservice_HTTPS_01'
  },
  'logFileName' : path.join(__dirname, "/../.logs/user_microservice01.log"),
};
