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

// Generate invoice validaton middlewares
Validator.prototype.generateInvoiceValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(body('email').isEmail());
  middlewares.push(body('cart').custom((cart) => {
    return typeof(cart.cartId) == 'string'
           && cart.cartId.match(/^[0-9a-fA-F]{24}$/)
           && typeof(cart.amount) =='number'
           && typeof(cart.cartItems) == 'object'
           && cart.cartItems instanceof Array;
  }));
  middlewares.push(validator.validateRequest());
  return middlewares;
};

// Export the module
export default new Validator();
