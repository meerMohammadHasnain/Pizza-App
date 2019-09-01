# Pizza-App

### Table of contents
* [Introduction](#Introduction)
* [Technologies](#Technologies)
* [Dependencies](#Dependencies)
* [Features](#Features)
* [Setup](#Setup)
* [Configurations](#Configurations)
* [License](#License)

---

### Introduction

>This is a web application that provides an interface to the services offered by a pizza restaurant, managing all the actions that can be performed by the users therein, including user creation, depiction of menu on request, creation of carts, modifications of the same, making payments, generation of invoice and mailing it to the respective user.

---

### Technologies
This application is developed following the *`Microservice Architecture Style`* leveraging traits of *`MVC Pattern`*. The technologies that are used to develop this application are:
* Node JS `v10.16.0`
* Express JS `v4.17.1`
* Mongoose `v5.6.9`

---

### Dependencies
Dependency           | Version          |
--------------------:|------------------|
express              |^4.17.1           |
mongoose             |^5.6.9            |
body-parser          |^1.19.0           |
config               |^3.2.2            |
dotenv               |^8.1.0            |
express-validator    |^6.1.1            |
jsonwebtoken         |^8.5.1            |
bcrypt               |^3.0.6            |
nodemon              |^1.19.1           |
request              |^2.88.0           |
winston              |^3.2.1            |
babel-cli            |^6.26.0           |
babel-preset-env     |^1.7.0            |
babel-preset-stage-0 |^6.24.1           |


---

### Features

#### Load balancing, Scalability and Service Discovery
* Each microservice is an independent application that, when started, registers itself in *`Consul`* (service registry). Refer official [documentation](https://www.consul.io/api/index.html) of Consul API for more insights.
* The services gets registered such that they will automatically get deregistered from Consul in case they get down.
* Each microservice has a heartbeat route that is actually used by *`Consul health check`* to inspect the status of the microservice.
* All the microservices can be scaled easily and managed by a load balancer. The one used in development is *`NGINX`*. Refer official [documentation](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/) of NGINX to gaining further insights into using it as a server side load balancer.
* In case the microservices are desired to be deployed without a load balancer, the same can be accomplished by making a few modification in their respective configuration files, the details of which are commented therein.
* The microservices can be scaled by deploying multiple instances on same or different servers, in order to achieve high performance. Refer [Configurations](#Configurations) section for further insights.
* In order to automate the process of service discovery by the load balancer, it is expected that a daemon thread like *`consul-template`* should be triggered before deployment that will write the configuration file of NGINX and reload it every time a microservice gets registered in Consul.
* Every request by the client will be targeted toward the load balancer, which in turn, will forward them to the respective instance of the concerned microservice.

#### Logging
* Each microservice has its own logger that will write comprehensible logs during the entire life cycle of the microservice.
* The log files are generated respective to each instance in order to facilitate their wiring to the Elastic Stack.
* It is suggested that wiring with *`Filebeat`* should be preferred. It's lucid to implement and configure. The same was used to wire and analyse the logs in Elastic Stack during local testing.
* Refer the official website of [Elastic Stack](https://www.elastic.co/products/elastic-stack) for more insights.

#### Integration of Transport Layer Security
* The application is developed such that it will run on both HTTP and HTTPS servers.
* During development, a dummy digital certificate was used to authenticate the server and hence it can't be tested locally unless we provide a trusted certificate.
* In case someone tries to run it securely on HTTPS with a dummy certificate, the service will automatically get deregistered from Consul, since the health check for microservice will result in being critical due to the certificate being signed by an untrusted authority.
* It should work fine in case of a trusted ceritficate, but a thorough testing must be performed for that, which was not accomplished during development.

#### User Authentication and Session Management
* In order to authenticate the user, the application makes use of JSON Web Tokens.
* The same is used for maintaining sessions as well.
* An outstanding benefit of this approach is that for authenticating a user, there is no need to inspect the database to retrieve the token for authentication. It ultimately saves time and makes the responses swifter.
* Refer the [NPM link for JSON Web Token](https://www.npmjs.com/package/jsonwebtoken) for more insights.
* The complete description of session management approach followed in this application will be updated here once the front end is ready to be pushed, since it has a great role to play in the same.

#### Third patry APIs
* The application makes use of sandbox of *`Stripe API`* for making payments. Read the official [documentation](https://stripe.com/docs/api) for more insights.
* The application automatically sends an invoice email to the respective user after successful payment. The same is implemented via the sandbox of *`Mailgun API`*. Refer its official [documentation](https://documentation.mailgun.com/en/latest/api_reference.html) for more insights.

#### Services provided
* The application provided APIs for creating a new user, retrieving his details, modifying them and deleting the user account.
* It provides multiple APIs to retrieve menu items from the database (Mongo DB), depending on the requirements, involving pagination, when needed.
* It provides APIs for creating a new cart, retrieving it, updating it and deleting it.
* It provides an API to accomplish payment for an existing cart and get an invoice email on the registered email address in case the payment is successful.
* The scaffolding of the application into three microservices, viz, *`userMicroservice`*, *`orderMicroservice`* and *`mailingMicroservice`*, is based on the functionalities that are provided therein. Thus, a good modularity is achieved in the application by development of each component as an independent microservice.

---

### Setup

> The application makes use of syntaxes and APIs introduced in **`ES6+`**, so it requires a transpiler like **`Babel`** for successful execution.

```
# Clone the repository
$ git clone https://github.com/meerMohammadHasnain/Pizza-App

# Navigate into the desired microservice
$ cd Pizza-App/userMicroservice/

# Install the dependencies
npm install

# Create a .env file including all the required environment variables
# and place it in the root folder of the concerned microservice.
# The complete list of environment variables is:
# HASHING_SECRET
# AUTH_TOKEN_SECRET
# KEY_FILE_LOCATION
# CERT_FILE_LOCATION
# STRIPE_AUTH_TOKEN
# MAILGUN_API_KEY
# MAILGUN_API_PERSONALISED_DOMAIN
# EMAIL_TEMPLATE_ID

# Set the deployment environment (using 'development' here)
$ export NODE_ENV=development

# Set the app instance (using '01' instance here)
$ export NODE_APP_INSTANCE=01

# Start the microservice
$ babel-node app.js

```
> *`Caveat`* : Setup of deployment environment and app instance will be different in case of Windows. The following configuration  for the same would suffice:
```
# Nuance in Windows to set deployment environment and app instance
set NODE_ENV=development
set NODE_APP_INSTANCE=01
```
> *`Running via Nodemon`* : The application can also be started via Nodemon. In that case, it will start in *`default`* mode in accordance with the specified app instance. If app instance is not specified, it will run on default port as mentioned in the **`default`** configuration file.
```
# Set the app instance
$ export NODE_APP_INSTANCE=01
# Setting of deployment environment is not required
# Start the microservice
$ npm run start
```
> *`Note`* : In case Consul server is down when the microservices start, they will not get registered. The logs will warn this scenario with a message "Could not register the microservice in Consul. Skipping it". The warning can be ingored if the microservices are managed in a standalone manner without a load balancer. But in case of a load balancer being used, this warning can't be ignored and Consul server must be activated before deployment, since skipping the registration would disrupt the service discovery that will occur thereafter.

---

### Configurations
> The application makes use of *`config`* library for handling configurations. Refer its [documentation](https://www.npmjs.com/package/config) on NPM website for more insights.

### License
> You can check out the full license [here](/LICENSE).<br>
This project is licensed under the terms of **MIT** license.
