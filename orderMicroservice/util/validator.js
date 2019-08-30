/*
*
* Validator functions
*
*/

// Dependencies
import {param, query, body} from 'express-validator';
import validator from './utilMiddlewares';

// Container function for validator
var Validator = function() {};

// Menu items validaton middlewares
Validator.prototype.getCategoryMenuValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(param('category').exists().custom((value) => {
    return ['veg', 'nonveg', 'beverages'].indexOf(value) !== -1;
  }));
  middlewares.push(query('id').optional().isMongoId().custom((value, {req}) => {
    return req.query.rating.trim().length > 0
           && !isNaN(req.query.rating)
           ? true : false;
  }));
  middlewares.push(validator.validateRequest());
  return middlewares;
};

// Menu item validation middlewares
Validator.prototype.getMenuItemValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(query('id').isMongoId());
  middlewares.push(validator.validateRequest());
  return middlewares;
};

Validator.prototype.createCartValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(body('menuItems').isArray().custom((menuItems) => {
    return Validator.prototype.validateCartMenuItems(menuItems);
  }));
  middlewares.push(validator.validateRequest());
  return middlewares;
};

Validator.prototype.getCartValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(query('id').isEmail());
  middlewares.push(validator.validateRequest());
  return middlewares;
};

Validator.prototype.updateCartValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(query('id').isMongoId());
  middlewares.push(body('menuItems').optional().isArray().custom((menuItems) => {
    return Validator.prototype.validateCartMenuItems(menuItems);
  }));
  middlewares.push(body('paymentStatus').optional().isBoolean());
  middlewares.push(body('invoiceGenerated').optional().isBoolean());
  return middlewares;
};

Validator.prototype.deleteCartValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(query('id').isMongoId());
  middlewares.push(validator.validateRequest());
  return middlewares;
};

Validator.prototype.validateCartMenuItems = function(menuItems) {
  var isValidated = false;
  for(let menuItem of menuItems.values()) {
    if(!menuItem.menuItemId || !menuItem.quantity) {
      isValidated = false;
      break;
    } else {
      if(menuItem.customization) {
        if(menuItem.customization.size
           && menuItem.customization.toppings
           && menuItem.customization.extras) {
          isValidated = typeof(menuItem.menuItemId) == 'string'
              && menuItem.menuItemId.match(/^[0-9a-fA-F]{24}$/)
              && typeof(menuItem.quantity) == 'number'
              && typeof(menuItem.customization.size) == 'string'
              && typeof(menuItem.customization.toppings) == 'object'
              && menuItem.customization.toppings instanceof Array
              && typeof(menuItem.customization.extras) == 'object'
              && menuItem.customization.extras instanceof Array;
          if(!isValidated) {
            break;
          }
        } else {
          isValidated = false;
          break;
        }
      } else {
        isValidated = typeof(menuItem.menuItemId) == 'string'
                      && menuItem.menuItemId.match(/^[0-9a-fA-F]{24}$/)
                      && typeof(menuItem.quantity) == 'number';
        if(!isValidated) {
            break;
        }
      }
    }
  }
  return isValidated;
};

Validator.prototype.deleteUserCartsValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(query('id').isEmail());
  middlewares.push(validator.validateRequest());
  return middlewares;
};

Validator.prototype.makePaymentValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(body('cartId').isMongoId());
  middlewares.push(body('customerId').isString().trim().isLength({'min' : 1}));
  middlewares.push(body('customerCardId').isString().trim().isLength({'min' : 1}));
  middlewares.push(validator.validateRequest());
  return middlewares;
};

Validator.prototype.updateInvoiceGenerationValidationMiddlewares = function() {
  var middlewares = [];
  middlewares.push(body('cartId').isMongoId());
  middlewares.push(body('cartUpdation').isJSON());
  return middlewares;
};
// Export the module
export default new Validator();
