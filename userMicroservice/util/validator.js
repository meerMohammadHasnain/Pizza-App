/*
*
* Validator functions
*
*/

// Dependencies
import {body, query} from 'express-validator';
import validator from './utilMiddlewares';

// Container function for validator
var Validator = function() {};

// Create user validaton middlewares
Validator.prototype.createUserValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(body('firstName').isAlpha());
  middlewares.push(body('lastName').isAlpha());
  middlewares.push(body('password').isString().trim().isLength({'min' : 1}));
  middlewares.push(body('phone').isMobilePhone());
  middlewares.push(body('email').isEmail());
  middlewares.push(body('address').isString().trim().isLength({'min' : 1}));
  middlewares.push(validator.validateRequest());
  return middlewares;
};

// Get user validaton middlewares
Validator.prototype.getUserValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(query('id').isEmail());
  middlewares.push(validator.validateRequest());
  return middlewares;
};

// Update user validation middlewares
Validator.prototype.updateUserValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(validator.validateMinFields());
  middlewares.push(body('email').isEmail());
  middlewares.push(body('firstName').optional().isAlpha());
  middlewares.push(body('lastName').optional().isAlpha());
  middlewares.push(body('password').optional().isString().trim().isLength({'min' : 1}));
  middlewares.push(body('phone').optional().isMobilePhone());
  middlewares.push(body('address').optional().isString().trim().isLength({'min' : 1}));
  middlewares.push(body('carts').optional().isArray());
  middlewares.push(validator.validateRequest());
  return middlewares;
};

// Delete user validaton middlewares
Validator.prototype.deleteUserValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(query('id').isEmail());
  middlewares.push(validator.validateRequest());
  return middlewares;
};

// Update user validation middlewares
Validator.prototype.createTokenValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(body('email').isEmail());
  middlewares.push(body('password').isString().trim().isLength({'min' : 1}));
  middlewares.push(validator.validateRequest());
  return middlewares;
};

// Export the module
export default new Validator();
