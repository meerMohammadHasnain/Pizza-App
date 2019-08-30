// Dependencies
import 'dotenv/config';
import path from 'path';

// Export the configuration object
export var config = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'consulInfo' : {
    'registeredServiceIdHttp' : 'mailing_microservice_HTTP_01',
    'registeredServiceIdHttps' : 'mailing_microservice_HTTPS_01'
  },
  'logFileName' : path.join(__dirname, "/../.logs/mailing_microservice01.log")
};
