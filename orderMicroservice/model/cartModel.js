/*
*
* Model for cart entity
*
*/

// Dependencies
import cartDataAccess from './../accessor/cartDataAccess';
import menuDataAccess from './../accessor/menuDataAccess';
import Model from './../schema/cartSchema';
import logger from './../util/logger';
import {config} from 'config';
import request from 'request';

// Container function for model
var CartModel = function() {};

// Model function for creating a cart
CartModel.prototype.createCart = async function(data, email, authToken) {
  await cartDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while creating the cart'}};
      });
  // Declare the cart amount
  var cartAmount = 0;
  // Iterating over each menu item in the request to create the cart
  for(let menuItem of data.menuItems.values()) {
    // Fetch the details of the menu item from the database
    var menuItemData = await menuDataAccess.getMenuItemById({'_id' : menuItem.menuItemId})
         .catch(err => {
           logger.error("[%s] Encountered an unexpected error while fetching the item '%s' to create the cart, itemId: %s, error: [%s]", email, menuItem.menuItemId, err);
           throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while creating the cart'}};
         });
    if(!menuItemData) {
      throw {'statusCode' : 400, 'body' : {'error' : 'One of the menu items does not exist'}};
    } else {
        // Add the item name to menu item object
        menuItem.itemName = menuItemData.itemName;
        // Deal the case of beverages separately
        if(menuItemData.category == 'beverages') {
          // If the menu item belongs to the category of beverages, get the
          // price for the item and add it to the cart amount
          cartAmount = cartAmount + menuItemData.price * menuItem.quantity;
          // Add the itemPrice field in the menu item
          menuItem.itemPrice = menuItemData.price;
        } else {
          // Get the base price of the specified sized item
          var basePrice = CartModel.prototype.getBasePriceOfItem(menuItemData, menuItem.customization);
          // Get the total price of all the toppings mentioned in the request
          var toppingsPrice = CartModel.prototype.getPriceOfCustomizations(menuItemData.toppings, menuItem.customization, "toppings");
          // Get the total price of all the extras mentioned in the request
          var extrasPrice = CartModel.prototype.getPriceOfCustomizations(menuItemData.extras, menuItem.customization, "extras");
          // Add the total price of the menu item to itemPrice
          menuItem.itemPrice = basePrice + toppingsPrice + extrasPrice;
          // Calculate the total price for this menu item and add it to the total cart amount
          cartAmount = cartAmount + menuItem.itemPrice * menuItem.quantity;
        }
    }
  }
  // Create the cart object to be stored in the database
  var cartData = {
    'email' : email,
    'items' : data.menuItems,
    'amount' : cartAmount,
    'paymentStatus' : false,
    'invoiceGenerated' : false
  };
  // Insert the cart document into the database
  var response = await cartDataAccess.createCart(cartData)
        .catch(err => {
         logger.error("[%s] Encountered an unexpected error while creating the cart, error: [%s]", email, err);
         throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while creating the cart'}};
       });
  logger.info("[%s] Created the cart successfully, cartId: '%s'", email, response['_id']);
  // Update the concerned user object
  await CartModel.prototype.updateUserObject(email, authToken, response['_id'])
      .catch(err => {
        // Close the databse connection
        cartDataAccess.closeDatabase();
        logger.error("[%s] Could not update the user object with the newly created cart, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while updating the concerned user object'}};
      });
  // Close the databse connection
  await cartDataAccess.closeDatabase()
         .catch(err => {
           logger.error("[%s] Could not close the database connection", email);
         });
  // Return the response
  return {
      'statusCode' : 201,
      'body' : response
  };
};

CartModel.prototype.updateUserObject = function(email, authToken, newCartId) {
  return new Promise(async (resolve, reject) => {
    // Hit a GET request to users microservice to fetch the concerned user obejct
    await request.get({
            'url' : config.microserviceUrls.userMicroservice,
            'qs' : {'id' : email},
            'headers': {
              'token' : authToken
            },
            'timeout' : 1000
          }, async (err, res, body) => {
      if(!err && res.statusCode == 200) {
        // Parse the response body
        body = JSON.parse(body);
        // Get user carts
        var userCarts = typeof(body.carts) == "object"
                   && body.carts instanceof Array
                   && body.carts.length > 0
                   ? body.carts : [];
        if(userCarts.length > 0) {
          // Create a reploica of user carts
          var carts = userCarts.slice(0, userCarts.length);
          // Iterate over the carts array
          for(let cartId of userCarts.values()) {
            // Lookup the cart object
            var cartObject = await cartDataAccess.getCart({'_id' : cartId})
                    .catch(err => {
                      reject("Couldn't access the cart object");
                    });
            if(cartObject) {
              // Check if the payment status in cart is false. If yes, delete it from the user object
              if(!cartObject.paymentStatus) {
                carts.splice(carts.indexOf(cartId), 1);
              }
            } else {
              // Delete the cart since it exists in user object but not in carts collection
              carts.splice(carts.indexOf(cartId), 1);
            }
          }
          // Make the user cart array point to the cart array
          userCarts = carts;
        }
        // Insert the new cart id in the user carts
        userCarts.push(newCartId);
        // Update the user object by hitting a PUT request to users microservice
        await request.put({
          'url' : config.microserviceUrls.userMicroservice,
          'headers': {
            'token' : authToken
          },
          'json' : {
            'email' : email,
            'carts' : userCarts
          },
          'timeout' : 1000
        }, (err, res, body) => {
          if(!err && res.statusCode == 200) {
            logger.info("[%s] Updated the user object successfully with the newly created cart", email);
            resolve();
          } else {
            reject(err);
          }
        });
      } else {
        logger.error("[%s] Couldn't access the user object", email);
        reject(err);
      }
    });
  }).catch(err => {
    throw err;
  });
};

// Supportive function for getting the base price of a menu item
CartModel.prototype.getBasePriceOfItem = function(menuItem, menuItemInReq) {
  // Find the variant object from the menu item variants array in the
  // database whose name matches with the size mentioned in the request
  var match = menuItem.variants.find((element) => {
    return element.size == menuItemInReq.size;
  });
  if(!match) {
    // Throw an bad request error if no such size exists
    throw {'statusCode' : 400, 'body' : {'error' : 'The specified size of one of the menu items is not valid'}};
  }
  // Add the base price field to the menu item object
  menuItemInReq.basePrice = match.price;
  // Return the base price
  return match.price;
};

// Supportive function for calculating total price of customizations of a particular category (toppings/ extras)
CartModel.prototype.getPriceOfCustomizations = function(customizationInDb, customizationInReq, customizationType) {
  // Define some useful parameters
  var reqCustomization = customizationType == 'toppings' ? customizationInReq.toppings : customizationInReq.extras;
  var customizationField = customizationType == 'toppings' ? 'topping': 'extra';
  // Declare the customization array
  var customizationArray = [];
  // Declare the customization price
  var customizationPrice = 0;
  // Map the menu item customization array fetched from the database,
  // which is an array of customization objects, to an array of customization names
  var customization = customizationInDb.map((element) => {
    return element[customizationField];
  });
  // Check, for each topping/extra mentioned in the request, if it is a valid one.
  // If yes, add its price to 'price'. If no, throw a bad request error.
  if(reqCustomization.length > 0) {
    for(let cus of reqCustomization) {
      if(customization.includes(cus)) {
        var index = customization.indexOf(cus);
        var price = customizationInDb[index].price;
        customizationPrice += price;
        customizationArray.push({'name' : cus, 'price' : price});
      } else {
        throw {'statusCode' : 400, 'body' : {'error' : 'A specified customization of one of the menu items is not valid'}};
      }
    }
  }
  // Make the customization in request object point to the customizationArray
  customizationInReq[customizationType] = customizationArray;
  // Return the customizationPrice
  return customizationPrice;
};

// Model function to get a cart
CartModel.prototype.getCart = async function(email, authToken) {
  // Fetch all the carts of the user
  var userCarts = await CartModel.prototype.fetchUserCarts(email, authToken)
      .catch(err => {
        throw err;
      });
  // Connect to the database
  await cartDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while fetching the cart'}};
      });
  // Define the response object
  var response = {
    'statusCode' : 200,
    'body' : {}
  };
  // Iterate over the userCarts array
  if(userCarts.length > 0) {
     // Fetch the all userCarts from the database
     var carts = await cartDataAccess.getCarts({'_id' : {'$in' : userCarts}})
          .catch(err => {
            throw err;
          });
     // Find the cart whose both paymentStatus and invoiceGenerated fileds are false
     var cart = carts.find((element) => {
       return !element.paymentStatus && !element.invoiceGenerated;
     });
     if(cart) {
       logger.info("[%s] Fetched the cart successfully, cartId: '%s'", email, cart['_id']);
       response.body = cart;
     }
  }
  // Close the database connection
  await cartDataAccess.closeDatabase()
       .catch(err => {
         logger.error("[%s] Could not close the database connection", email);
       });
  // Return the response
  return response;
};

// Fetch all the carts of the user
CartModel.prototype.fetchUserCarts = function(email, authToken) {
  return new Promise((resolve, reject) => {
    // Hit a GET request to users microservice to get the concerned user object
    request.get({
            'url' : config.microserviceUrls.userMicroservice,
            'qs' : {'id' : email},
            'headers': {
              'token' : authToken
            },
            'timeout' : 1000
          }, (err, res, body) => {
            if(!err && res.statusCode == 200) {
              // Parse the response body
              body = JSON.parse(body);
              // Get user carts
              var userCarts = typeof(body.carts) == "object"
                         && body.carts instanceof Array
                         && body.carts.length > 0
                         ? body.carts : [];
              // Resolve the promise with user carts
              resolve(userCarts);
            } else if(!err && res.statusCode == 400){
              reject({'statusCode' : 400, 'body' : {'error' : 'User doesn\'t exist'}});
            } else {
              logger.error("[%s] Encountered an unexpected error while fetching user cart, error: [%s]", email, err);
              reject({'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while fetching user cart'}});
            }
          });
  }).catch(err => {
    throw err;
  });
}

// Model function for updating a cart
CartModel.prototype.updateCart = async function(cartId, cartData, email) {
  // Connect to the database
  await cartDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while updating the cart'}};
      });
  // Check if the cart exists
  var cart = await cartDataAccess.getCart({'_id' : cartId})
       .catch(err => {
         logger.error("[%s] Encountered an unexpected error while updating the cart, error: [%s]", email, err);
         throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while updating the cart'}};
       });
  if(cart) {
    // Declare the cart amount
    var cartAmount = 0;
    // Iterating over each menu item in the request to create the cart
    for(let menuItem of cartData.menuItems.values()) {
      // Fetch the details of the menu item from the database
      var menuItemData = await menuDataAccess.getMenuItemById({'_id' : menuItem.menuItemId})
           .catch(err => {
             logger.error("[%s] Encountered an unexpected error while fetching the item '%s' to create the cart, itemId: %s, error: [%s]", email, menuItem.menuItemId, err);
             throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while creating the cart'}};
           });
      if(!menuItemData) {
        throw {'statusCode' : 400, 'body' : {'error' : 'One of the menu items does not exist'}};
      } else {
          // Add the item name to menu item object
          menuItem.itemName = menuItemData.itemName;
          // Deal the case of beverages separately
          if(menuItemData.category == 'beverages') {
            // If the menu item belongs to the category of beverages, get the
            // price for the item and add it to the cart amount
            cartAmount = cartAmount + menuItemData.price * menuItem.quantity;
            // Add the itemPrice field in the menu item
            menuItem.itemPrice = menuItemData.price;
          } else {
            // Get the base price of the specified sized item
            var basePrice = CartModel.prototype.getBasePriceOfItem(menuItemData, menuItem.customization);
            // Get the total price of all the toppings mentioned in the request
            var toppingsPrice = CartModel.prototype.getPriceOfCustomizations(menuItemData.toppings, menuItem.customization, "toppings");
            // Get the total price of all the extras mentioned in the request
            var extrasPrice = CartModel.prototype.getPriceOfCustomizations(menuItemData.extras, menuItem.customization, "extras");
            // Add the total price of the menu item to itemPrice
            menuItem.itemPrice = basePrice + toppingsPrice + extrasPrice;
            // Calculate the total price for this menu item and add it to the total cart amount
            cartAmount = cartAmount + (basePrice + toppingsPrice + extrasPrice) * menuItem.quantity;
          }
      }
    }
    // Create the cart object to be updated in the database
    var cartData = {
      'items' : cartData.menuItems,
      'amount' : cartAmount
    };
    // Update the cart
    var response = await cartDataAccess.updateCart({'_id' : cartId}, cartData)
          .catch(err => {
           logger.error("[%s] Encountered an unexpected error while updating the cart, error: [%s]", email, err);
           throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while updating the cart'}};
         });
    logger.info("[%s] Updated the cart successfully, id: '%s'", email, cartId);
    // Close the databse connection
    cartDataAccess.closeDatabase();
    // Return the response
    return {
        'statusCode' : 200,
        'body' : {'body' : 'Updated the cart successfully'}
    };
  } else {
    throw {'statusCode' : 400, 'body' : {'error' : 'Cart doesn\'t exist'}};
  }
};

// Model function for deleting a cart
CartModel.prototype.deleteCart = async function(cartId, email) {
  // Connect to the database
  await cartDataAccess.connectDatabase()
      .catch(err => {
        logger.error("Could not connect to the database, error: [%s]", err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while deleting the cart'}};
      });
  // Check if the cart exists
  var isExistingCart = await Model.exists({'_id' : cartId})
      .catch(err => {
        logger.error("Encountered an unexpected error while deleting the cart, error: [%s]", err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while deleting the cart'}};
      });
  // Return bad request if the cart doesn't exist
  if(!isExistingCart) {
    return {'statusCode' : 400, 'body' : {'error' : 'Cart doesn\'t exist'}};
  } else {
    // Delete the cart, if it extsts
    var response = await cartDataAccess.deleteCart({'_id' : cartId})
        .catch(err => {
          logger.error("Encountered an unexpected error while deleting the cart, error: [%s]", err);
          throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while deleting the cart'}};
        });
    // Close the database connection
    cartDataAccess.closeDatabase()
            .catch(err => {
              logger.error("[%s] Could not close the database conection", email);
            });
    logger.info("[%s] Deleted the cart successfully, cartId: %s", email, cartId);
    // Return the response
    return {
      'statusCode' : 200,
      'body' : {'body' : 'Deleted the cart successfully'}
    };
  }
};

// Model function for deleting all the carts of a user
CartModel.prototype.deleteCarts = async function(emailInReq, emailInToken) {
  // If the email received as a query paramter in the request and the one obtaied
  // by decoding the authToken mismatch, throw an unauthorised user error
  if(emailInReq !== emailInToken) {
    throw {'statusCode' : 403, 'body' : {'error' : 'You aren\'t authorised to delete this user carts'}};
  }
  // Connect to the database
  await cartDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", emailInToken, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while deleting the user carts'}};
      });
  // Delete the carts
  var response = await cartDataAccess.deleteCarts({'email' : emailInReq})
      .catch(err => {
        logger.error("[%s] Encountered an unexpected error while deleting user carts, error: [%s]", emailInToken, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while deleting user cart'}};
      });
  // Close the database connection
  cartDataAccess.closeDatabase()
       .catch(err => {
        logger.error("[%s] Could not close the database conection", emailInToken);
      });
  // Throw a bad request error if no carts were found for the concerend user
  if(response.n == 0) {
    logger.info("[%s] No carts were found to be deleted for the user, email: %s", emailInToken, emailInReq);
    throw {'statusCode' : 400, 'body' : {'error' : 'No carts were found to be deleted'}};
  }
  logger.info("[%s] Deleted the user carts successfully", emailInToken);
  // Return the response
  return {
    'statusCode' : 200,
    'body' : {'body' : 'Deleted the cart successfully'}
  };
};

CartModel.prototype.updateInvoiceGenerationStatus = async function(cart, email) {
  // Connect to the database
  await cartDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while updating invoice generation status in the cart'}};
      });
  // Check if the cart exists
  var isExistingCart = await Model.exists({'_id' : cart.cartId})
      .catch(err => {
        logger.error("[%s] Encountered an unexpected error while varifying the cart for invoice generation status updation, cartId: '%s', error: [%s]", email, cart.cartId, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while verifying the cart for invoice generation status updation'}};
      });
  if(isExistingCart) {
    // Update the cart, if it exists
    var response = await cartDataAccess.updateCart({'_id' : cart.cartId}, cart.cartUpdation)
          .catch(err => {
           logger.error("[%s] Encountered an unexpected error while updating the invoice generation status in the cart, cartId: '%s', error: [%s]", email, cart.cartId, err);
           throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while updating the cart'}};
         });
    logger.info("[%s] Updated the invoice generation status successfully in the cart '%s'", email, cart.cartId);
    // Return the response
    return {
      'statusCode' : 200,
      'body' : {'body' : 'Sucessfully updated the invoice generation status in the cart'}
    };
  } else {
    // Throw a bad request error if the cart doesn't exist
    throw {'statusCode' : 400, 'body' : {'error' : 'Cart doesn\'t exist'}};
  }
};

// Export the module
export default new CartModel();
