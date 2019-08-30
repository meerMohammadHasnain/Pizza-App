/*
*
* Helper functions for the application
*
*/

// Dependencies
import bcrypt from 'bcrypt';
import {config} from 'config';
import jwt from 'jsonwebtoken';

// Container function for helpers
var Helpers = function() {};

// Helper for hashing a string
Helpers.prototype.hash = async function(str) {
  var response = bcrypt.hash(str, config.saltRounds)
    .catch(err => {
      throw err;
    });
  return response;
};

// Helper to sign auth token
Helpers.prototype.signToken = function(payload) {
  return Promise.race([new Promise((resolve, reject) => {
    jwt.sign(payload, config.authTokenSecret, {
      'expiresIn' : '3h',
      'issuer' : config.authTokenIssuer
    }, (err, token) => {
      if(!err && token) {
        resolve(token);
      } else {
        reject(err);
      }
    });
  }), this.timeoutPromise(1000)]);
};

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
