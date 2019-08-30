/*
*
* Model for token entity
*
*/

// Dependencies
import userDataAccess from './../accessor/userDataAccess';
import logger from './../util/logger';
import Model from './../schema/userSchema';
import helpers from './../util/helpers';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {config} from 'config';

// Container function for token model
var TokenModel = function() {};

// Model function for creating an auth token
TokenModel.prototype.createAuthToken = async function(userData) {
  // Connect to the database
  await userDataAccess.connectDatabase()
      .catch(err => {
        logger.error("Could not connect to the database, error: [%s]", err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while authenticating the user'}};
      });
  // Get the user document from the database
  var response = await userDataAccess.getUser({'email' : userData.email})
      .catch(err => {
        logger.error("Encountered an unexpected error while authenticating the user, error: [%s]", err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while authenticating the user'}};
      });
  if(response) {
    // If the user document exists, compare the hashed password stored therein
    // and the password that's received in the request.
    /*
      NOTE: The "compare" function counters timing attacks (using a so-called 'constant-time'
      algorithm), as stated in the official documentation of 'bcrypt' libarary. Refer to its
      documentation at 'https://github.com/kelektiv/node.bcrypt.js#readme' for more insights.
    */
    var isMatching = await bcrypt.compare(userData.password, response.password)
        .catch(err => {
          logger.error("Encountered an unexpected error while authenticating the user, error: [%s]", err);
          throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while authenticating the user'}};
        });
    if(isMatching) {
      // If the passwords match, sign the token
      var authToken = await helpers.signToken({'user' : response}, config.authTokenSecret, {'issuer': config.authTokenIssuer})
            .catch(err => {
              logger.error("Encountered an unexpected error while generating the token, error: [%s]", err);
              throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while generating the token'}};
            })
      logger.info("[%s] Generated the auth token successfully", response.email);
      // Return the signed JSON Web Token in the response
      return {
        'statusCode' : 200,
        'body' : {
          'authToken' : authToken
        }
      };
    } else {
      // If the paswords don't match, throw an unauthenticated user error
      return {'statusCode' : 401, 'body' : {'error' : 'Unauthorised user'}};
    }
  } else {
    // If the user document is not found in the database, assume the request
    // to be raised by an unauthenticated user
    return {'statusCode' : 401, 'body' : {'error' : 'Unauthorised user'}};
  }
};

// Export the module
export default new TokenModel();
