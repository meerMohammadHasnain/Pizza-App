/*
*
* Model for making payment
*
*/

// Dependencies
import cartDataAccess from './../accessor/cartDataAccess';
import logger from './../util/logger';
import {config} from 'config';
import url from 'url';
import request from 'request';

// Container function for model
var PaymentModel = function() {};

// Model function for making payment
PaymentModel.prototype.makePayment = async function(isRequestSecure,
                                                    host,
                                                    paymentData,
                                                    email,
                                                    authToken) {
  // Connect to the database
  await cartDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while verifying the cart for making payment'}};
      });
  // Check if the cart exists
  var cart = await cartDataAccess.getCart({'_id' : paymentData.cartId})
       .catch(err => {
         logger.error("[%s] Encountered an unexpected error while verifying the cart for payment [%s]", email, err);
         throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while verifying the cart for making payment'}};
       });
  if(cart) {
    // Form request options object
    var requestOptions = PaymentModel.prototype.formRequestOptions(isRequestSecure,
                                                                   host,
                                                                   paymentData,
                                                                   cart.items,
                                                                   email);
    // Make payment by hitting Stripe API
    var response = await PaymentModel.prototype.hitStripeAPIForPayment(requestOptions,
                                                                       paymentData.cartId,
                                                                       email)
                      .catch(err => {
                          // Close the database connection
                          cartDataAccess.closeDatabase()
                                  .catch(err => {
                                      logger.error("[%s] Could not close the database connection", email);
                                  });
                          // Throw the error to the router
                          throw err;
                      });
   // Once payment is accomplihed successfully, update its status in the concerned cart object
    var updationResponse = await PaymentModel.prototype.updatePaymentStatusInCartObject(paymentData.cartId, email)
                       .catch(err => {
                          throw err;
                        });
    // Close the database connection
    cartDataAccess.closeDatabase()
          .catch(err => {
            logger.error("[%s] Could not close the database connection", email);
          });
    // Hit mailing micoroservice to send invoice email
    PaymentModel.prototype.sendInvoiceEmail(cart, email, authToken);
    // Return the response
    return updationResponse;
  } else{
    // Close the database connection
    cartDataAccess.closeDatabase()
          .catch(err => {
            logger.error("[%s] Could not close the database connection", email);
          });
    throw {'statusCode' : 400, 'body' : {'error' : 'Cart doesn\'t exist. Payment can\'t be initiated'}};
  }
};

// Supportive function for hitting a POST request to Stripe API for making payment
PaymentModel.prototype.hitStripeAPIForPayment = function(requestOptions, cartId, email) {
  return new Promise((resolve, reject) => {
    // Hit Stripe API to make a payment
    request.post(requestOptions, async (err, res, body) => {
      if(!err && res.statusCode == 200) {
        logger.info("[%s] Payment accomplished successfully for the cart, '%s'", email, cartId);
        resolve(body);
      } else {
        logger.error("[%s] Payment failed for the cart: '%s'", email, cartId);
        reject({'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while making the payment'}});
      }
    });
  });
};

// Supportive function to form request options object
PaymentModel.prototype.formRequestOptions = function(isRequestSecure,
                                                     host,
                                                     paymentData,
                                                     cartData,
                                                     email) {
  // Create basic auth token
  var authToken = config.stripeApiInfo.authToken.concat(':');
  // Decode auth token to base64
  var decodedAuthToken = Buffer.from(authToken).toString("base64");
  // Form payload object
  var payload = PaymentModel.prototype.formPayload(isRequestSecure,
                                                   host,
                                                   paymentData,
                                                   cartData,
                                                   email);
  // Create the request details object and return it
  return {
    'url' : config.stripeApiInfo.url,
    'headers' : {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Authorization' :  'Basic '.concat(decodedAuthToken)
    },
    'form' : payload,
    'timeout' : 2000
  };
};

// Supportive function to form request payload
PaymentModel.prototype.formPayload = function(isRequestSecure,
                                              host,
                                              paymentData,
                                              cartData,
                                              email) {
  // Define the protocol for success or cancel URLs
  var protocol = isRequestSecure ? 'https' : 'http';
  // Define the success URL
  var successUrl = url.format({
    'protocol' : protocol,
    'host' : host,
    'pathname' : '/success'
  });
  // Define the cancel URL
  var cancelUrl = url.format({
    'protocol' : protocol,
    'host' : host,
    'pathname' : '/cancel'
  });
  // Map cartData to line items to be included in the payload
  var lineItems = cartData.map((menuItem) => {
    return {
      'name' : menuItem.itemName,
      'amount' : menuItem.itemPrice,
      'currency' : 'usd',
      'quantity' : menuItem.quantity
    };
  });
  // Create and return the payload object
  return {
    'payment_method_types' : ['card'],
    'client_reference_id' : paymentData.customerCardId,
    'customer' : paymentData.customerId,
    'success_url' : successUrl,
    'cancel_url' : cancelUrl,
    'line_items' : lineItems
  };
};

// Supportive function to update payment status in the concerned cart object
PaymentModel.prototype.updatePaymentStatusInCartObject = function(cartId, email) {
  return new Promise((resolve, reject) => {
    // Update the payment status to true
    var updatedFieldInCart = {'paymentStatus' : true};
    // Update the cart object with payment status as true
    cartDataAccess.updateCart({'_id' : cartId}, updatedFieldInCart)
          .then(response => {
            logger.info("[%s] Updated the cart object with payment status successfully, cartId: '%s'", email, cartId);
            resolve({'statusCode' : 200, 'body' : {'body' : 'Payment accomplished successfully'}});
          })
          .catch(err => {
           logger.error("[%s] Encountered an unexpected error while updating the cart with payment status, error: [%s]", email, err);
           reject({'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while updating the cart with payment status'}});
         });
  });
};

// Supprtive function to send invoice email
PaymentModel.prototype.sendInvoiceEmail = function(cart, email, authToken) {
  // Create an array of item names from cart object
  var cartItems = cart.items.map((item) => {
    return item.itemName;
  });
  // Form the invoice payload
  var invoicePayload = {
    'email' : email,
    'cart' : {
      'cartId' : cart['_id'],
      'created' : cart.created,
      'amount' : cart.amount,
      'cartItems' : cartItems
    }
  };
  // Hit a POST request on mailing micorservice to send invoice email
  request.post({
    'url' : config.microserviceUrls.mailingMicroservice,
    'headers' : {
      'token' : authToken
    },
    'json' : invoicePayload,
    'timeout' : 3000
  }, (err, res, body) => {
    if(!err && res.statusCode == 200) {
      logger.info("[%s] Sent the invoice email successfully at '%s' for the cart '%s'", email, email, cart['_id'])
    } else {
      logger.error("[%s] Encountered an unexpected error while sending the invoice email at %s for the cart, cartId: %s", email, email, cart['_id']);
    }
  });
};

// Export the module
export default new PaymentModel();
