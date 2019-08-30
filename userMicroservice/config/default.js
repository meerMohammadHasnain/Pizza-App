// Dependencies
import 'dotenv/config';
import path from 'path';

// Export the configuration object
export var config = {
 'envName' : process.env.NODE_ENV,
 'host' : '127.0.0.1',
 'httpPort' : 1008,
 'httpsPort' : 1009,
 'microserviceName' : 'user_microservice',
 'mongodbInfo' : {
   'protocol' : 'mongodb',
   'host' : '127.0.0.1',
   'port' : 27017,
   'dbName' : '/userDB'
 },
 'consulInfo' : {
   'protocol': 'http',
   'consulHost' : '127.0.0.1',
   'consulPort' : 8500,
   'apiPath' : '/v1/agent/service/register',
   'registeredServiceNameHttp' : 'user_microservice_HTTP',
   'registeredServiceNameHttps' : 'user_microservice_HTTPS',
   'registeredServiceIdHttp' : 'user_microservice_HTTP',
   'registeredServiceIdHttps' : 'user_microservice_HTTPS'
 },
 'microserviceUrls' : {
   /*
   * Specify the URL of load balancer server here, appended by identification path of the
     concerned microservice.
   * Example (for HTTP NGINX Server) - http://127.0.0.1:8083/orderMicroservice/carts (as mentioned)
             NOTE: 8083 is the port used during development.
   * Example (for HTTPS NGINX Server) - http://127.0.0.1:8084/orderMicroservice/carts
             NOTE: 8084 is the port used during development.
   * Do the same for all the other microservices, if they're required to be included here.
   * In case microservices are used in standalone manner without a load balancer, specify the URL
     of the concerned server here.
   * Example (if the microservice runs at port 5000 on localhost) - http://localhost:5000/carts
   */
   'orderMicroservice' : 'http://127.0.0.1:8083/orderMicroservice/carts'
 },
 'keyFileLocation' : process.env.KEY_FILE_LOCATION,
 'certFileLocation' : process.env.CERT_FILE_LOCATION,
 'logFileName' : path.join(__dirname, "/../.logs/user_microservice.log"),
 'saltRounds' : 10,
 'authTokenIssuer' : 'www.pizzaapp.com',
 'authTokenSecret' : process.env.AUTH_TOKEN_SECRET
};
