/*
*
* Utility middlewares
*
*/

// Dependencies
import {validationResult} from 'express-validator';
import helpers from './helpers';
import logger from './logger';
import {config} from 'config';

// Container function for utility middlewares
var UtilMiddlewares = function() {};

// JSON parsing error handling middleware
UtilMiddlewares.prototype.catchParsingError = function() {
  return function(err, req, res, next) {
    if(err) {
      res.status(400).send({'error' : 'Invalid JSON in the input'});
    } else {
      next();
    }
  };
};

// Default error handling middleware
UtilMiddlewares.prototype.defaultErrorHandler = function() {
  return function(err, req, res, next) {
    if(err) {
      res.status(500).send({'error' : 'Encountered an unexpected error while serving the request'});
    } else {
      next();
    }
  };
};

// Authentication token validation middleware
UtilMiddlewares.prototype.verifyAuthentication = function() {
  return async function(req, res, next) {
    var authToken = req.headers.token;
    if(authToken) {
       await helpers.verifyToken(authToken,
                                 config.authTokenSecret,
                                 {'issuer': config.authTokenIssuer})
        .then(response => {
          req.userEmail = response.user.email;
          next();
        })
        .catch(err => {
             if(err.name) {
               if(err.name == 'TokenExpiredError') {
                 res.status(401).send({'error' : 'Token has already expired'});
               } else {
                 res.status(401).send({'error' : 'Unauthenticated user'});
               }
             } else {
               logger.error("Encountered an unexpected error while authenticating the user, error: [%s]", err);
               res.status(500).send({'error' : 'Encountered an unexpected error while authenticating the user'});
             }
        });
    } else {
      res.status(401).send({'error' : 'Missing authentication token'});
    }
  }
};

// Request validation middleware
UtilMiddlewares.prototype.validateRequest = function() {
  return function(req, res, next) {
    if(!validationResult(req).isEmpty()) {
      res.status(400).send({'body' : 'Missing or invalid required field(s)'});
    } else {
      next();
    }
  };
};

// Export the module
export default new UtilMiddlewares();
