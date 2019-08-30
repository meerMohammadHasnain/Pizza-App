/*
*
* Model for user entity
*
*/

// Dependencies
import userDataAccess from './../accessor/userDataAccess';
import logger from './../util/logger';
import Model from './../schema/userSchema';
import helpers from './../util/helpers';
import request from 'request';
import {config} from 'config';

// Container function for user model
var UserModel = function() {};

// Model function for creating a user
UserModel.prototype.createUser = async function(userData) {
  // Connect to the database
  await userDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", userData.email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while authenticating the user'}};
      });
  // Check if the user already exists
  var isExistingUser = await Model.exists({'email' : userData.email})
      .catch(err => {
        logger.error("[%s] Encountered an unexpected error while creating the user, error: [%s]", userData.email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while creating the user'}};
      });
  if(isExistingUser) {
    // Throw a bad request error if the user already exists
    return {'statusCode' : 400, 'body' : {'error' : 'User already exists'}};
  } else {
    // If the user is a new user, hash the password
    userData.password = await helpers.hash(userData.password)
         .catch(err => {
           logger.error("[%s] Could not hash the password, error: [%s]", userData.email, err);
           throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while creating the user'}};
         });
    // Create the user document in the database
    var response = await userDataAccess.createUser(userData)
         .catch(err => {
           logger.error("[%s] Could not create the user, error [%s]: ", userData.email, err);
           throw {'statusCode' : 500, 'body' : {'error' : 'Could not create the user'}};
         });
   logger.info("[%s] Created the user successfully, email: %s", userData.email, response.email);
   // Return the response
   return {
     'statusCode' : 201,
     'body' : {
       'firstName' : response.firstName,
       'lastName' : response.lastName,
       'email' : response.email,
       'phone' : response.phone,
       'address' : response.address
     }
   };
  }
};

// Model function for retrieving a user
UserModel.prototype.getUser = async function(email) {
  // Connect to the database
  await userDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while retrieving the user'}};
      });
  // Get the user document from the database
  var response = await userDataAccess.getUser({'email' : email})
      .catch(err => {
        logger.error("[%s] Encountered an unexpected error while retrieving the user, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while retrieving the user'}};
      });
  if(response) {
    logger.info("[%s] Retrieved the user successfully, email: %s", email, response.email);
    // Return the user document as response, if it's found in the database
    return {
      'statusCode' : 200,
      'body' : {
        'firstName' : response.firstName,
        'lastName' : response.lastName,
        'email' : response.email,
        'phone' : response.phone,
        'address' : response.address,
        'carts' : response.carts || []
      }
    };
  } else {
    // Return a bad request error if user document is not found in the database
    return {'statusCode' : 400, 'body' : {'error' : 'User doesn\'t exist'}};
  }
};

// Model function for updating a user
UserModel.prototype.updateUser = async function(userData, email) {
  // Connect to the database
  await userDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while updating the user'}};
      });
  // Check if the user doesn't exist
  var isExistingUser = await Model.exists({'email' : userData.email})
      .catch(err => {
        logger.error("[%s] Encountered an unexpected error while updating the user, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while updating the user'}};
      });
  if(!isExistingUser) {
    // Respond a bad request error if the user doesn't exist
    return {'statusCode' : 400, 'body' : {'error' : 'User doesn\'t exist'}};
  } else {
    if(userData.password) {
      // If the user is an existing user, hash the password, if it's required to be updated
      userData.password = await helpers.hash(userData.password)
           .catch(err => {
             logger.error("[%s] Could not hash the password, error: [%s]", email, err);
             throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while updating the user'}};
           });
    }
    // Save back the updated user document in the database
    var response = await userDataAccess.updateUser({'email' : userData.email}, userData)
         .catch(err => {
           logger.error("[%s] Could not update the user, error [%s]: ", email, err);
           throw {'statusCode' : 500, 'body' : {'error' : 'Could not update the user'}};
         });
   logger.info("[%s] Updated the user successfully, email: %s", email, userData.email);
   // Return the response
   return {
     'statusCode' : 200,
     'body' : {'body' : 'Updated the user successfully'}
   };
  }
};

// Model function for deleting a user
UserModel.prototype.deleteUser = async function(email, authToken) {
  // Connect to the database
  await userDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while deleting the user'}};
      });
  // Check if the user exists
  var isExistingUser = await Model.exists({'email' : email})
      .catch(err => {
        logger.error("[%s] Encountered an unexpected error while deleting the user, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while deleting the user'}};
      });
  if(!isExistingUser) {
    // Throw a bad request error if the user doesn't exist
    return {'statusCode' : 400, 'body' : {'error' : 'User doesn\'t exist'}};
  } else {
    // If the user document exists, delete it
    var response = await userDataAccess.deleteUser({'email' : email})
        .catch(err => {
          logger.error("[%s] Encountered an unexpected error while deleting the user, error: [%s]", email, err);
          throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while deleting the user'}};
        });
    logger.info("[%s] Deleted the user successfully, email: %s", email, email);
    // Define the response object
    var res = {
      'statusCode' : 200
    };
    // Delete all the carts of the concerned user
    res.body = await UserModel.prototype.deleteUserCarts(email, authToken)
            .catch(err => {
              logger.error("[%s] Encountered an unexpected error while deleting user carts, error: [%s]", email, err);
              throw {'statusCode' : 500, 'body' : {'error' : 'User deleted succesfully but encountered an error while deleting his carts'}};
            });
    // Return the response
    return res;
  }
};

UserModel.prototype.deleteUserCarts = function(email, authToken) {
  return new Promise((resolve, reject) => {
    // Hit a DELETE request to order microservice to delete user carts
    request.delete({
      'url' : config.microserviceUrls.orderMicroservice,
      'qs' : {'id' : email},
      'headers' : {
        'token' : authToken
      },
      'timeout' : 1000
    }, (err, res, body) => {
      if(!err && res.statusCode == 200) {
        logger.info("[%s] Successfully deleted all the carts related to the user, email: %s", email, email);
        resolve({'body' : 'Deleted the user and all his carts successfully'});
      } else if(!err && res.statusCode == 400){
        logger.info("[%s] No carts were found for this user to be deleted, email: %s", email, email);
        resolve({'body' : 'Deleted the user successfully'});
      } else {
        reject(err);
      }
    });
  });
};

// Export the module
export default new UserModel();
