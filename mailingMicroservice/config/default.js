// Dependencies
import 'dotenv/config';
import path from 'path';

// Export the configuration object
export var config = {
 'envName' : process.env.NODE_ENV,
 'host' : '127.0.0.1',
 'httpPort' : 3008,
 'httpsPort' : 3009,
 'microserviceName' : 'mailing_microservice',
 'consulInfo' : {
   'protocol': 'http',
   'consulHost' : '127.0.0.1',
   'consulPort' : 8500,
   'apiPath' : '/v1/agent/service/register',
   'registeredServiceNameHttp' : 'mailing_microservice_HTTP',
   'registeredServiceNameHttps' : 'mailing_microservice_HTTPS',
   'registeredServiceIdHttp' : 'mailing_microservice_HTTP',
   'registeredServiceIdHttps' : 'mailing_microservice_HTTPS'
 },
 'mailgunApiInfo' : {
   'url' : `https://api.mailgun.net/v3/${process.env.MAILGUN_API_PERSONALISED_DOMAIN}/messages`,
   'apiKey' : process.env.MAILGUN_API_KEY,
   'emailSender' : `Pizza App <pizzaapp@${process.env.MAILGUN_API_PERSONALISED_DOMAIN}>`,
   'emailTemplateId' : process.env.EMAIL_TEMPLATE_ID
 },
 'microserviceUrls' : {
   /*
   * Specify the URL of load balancer server here, appended by identification path of the
     concerned microservice.
   * Example (for HTTP NGINX Server) - http://127.0.0.1:8083/userMicroservice/users (as mentioned)
             NOTE: 8083 is the port used during development.
   * Example (for HTTPS NGINX Server) - http://127.0.0.1:8084/userMicroservice/users
             NOTE: 8084 is the port used during development.
   * Do the same for all the other microservices, if they're required to be included here.
   * In case microservices are used in standalone manner without a load balancer, specify the URL
     of the concerned server here.
   * Example (if the microservice runs at port 5000 on localhost) - http://localhost:5000/users
   */
   'userMicroservice' : 'http://127.0.0.1:8083/userMicroservice/users',
   'orderMicroservice' : 'http://127.0.0.1:8083/orderMicroservice/cart/invoice'
 },
 'keyFileLocation' : process.env.KEY_FILE_LOCATION,
 'certFileLocation' : process.env.CERT_FILE_LOCATION,
 'logFileName' : path.join(__dirname, "/../.logs/mailing_microservice.log"),
 'saltRounds' : 10,
 'authTokenIssuer' : 'www.pizzaapp.com',
 'authTokenSecret' : process.env.AUTH_TOKEN_SECRET
};
