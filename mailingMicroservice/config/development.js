// Dependencies
import 'dotenv/config';
import path from 'path';

// Export the configuration object
export var config = {
 'host' : '127.0.0.1',
 'httpPort' : 3008,
 'httpsPort' : 3009,
 'consulInfo' : {
   'consulHost' : '127.0.0.1',
   'consulPort' : 8500
 },
 'keyFileLocation' : path.join(__dirname, "/../https/key.pem"),
 'certFileLocation' : path.join(__dirname, "/../https/cert.pem"),
 'logFileName' : path.join(__dirname, "/../.logs/mailing_microservice.log")
};
