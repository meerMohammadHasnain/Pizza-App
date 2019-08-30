// Depedencies
import 'dotenv/config';
import path from 'path';

// Export the configuration object
export var config = {
  'httpPort' : 1002,
  'httpsPort' : 1003,
  'consulInfo' : {
    'registeredServiceIdHttp' : 'user_microservice_HTTP_02',
    'registeredServiceIdHttps' : 'user_microservice_HTTPs_02'
  },
  'logFileName' : path.join(__dirname, "/../.logs/user_microservice02.log"),
};
