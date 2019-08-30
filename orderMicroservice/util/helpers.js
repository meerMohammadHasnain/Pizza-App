/*
*
* helper functions for the application
*
*/

// Dependencies
import {config} from 'config';
import jwt from 'jsonwebtoken';

// Container function for helpers
var Helpers = function() {};

// Helper to verify auth token
Helpers.prototype.verifyToken = function(token) {
  return Promise.race([new Promise((resolve, reject) => {
    jwt.verify(token, config.authTokenSecret, {
      'expiresIn' : '3h',
      'issuer' : config.authTokenIssuer
    }, (err, decoded) => {
      if(!err && decoded) {
        resolve(decoded);
      } else {
        reject(err);
      }
    });
  }), this.timeoutPromise(1000)]);
};

// Helper to timeout a promise
Helpers.prototype.timeoutPromise = function(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout error');
    }, delay);
  });
}

// Export the module
export default new Helpers();
