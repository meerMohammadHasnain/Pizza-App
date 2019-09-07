/*
*
* Model for user entity
*
*/

// Dependencies
import logger from './../util/logger';
import request from 'request';
import {config} from 'config';

// Container function for user model
var InvoiceModel = function() {};

// Model function for generating an invoice
InvoiceModel.prototype.generateInvoice = async function(invoiceData, email, authToken) {
  // Hit user microservice to get user details
  var userData = await InvoiceModel.prototype.fetchUserData(email, authToken)
                   .catch(err => {
                     throw err;
                   });
  // Generate request options object for invoice generation
  var requestOptions = InvoiceModel.prototype.generateRequestOptions(userData,
                                                                     invoiceData.cart,
                                                                     email);
  // Hit Mailgun API to send an email
  var response = await InvoiceModel.prototype.sendEmailViaMailgun(email,
                                                                  requestOptions,
                                                                  invoiceData.cart.cartId)
                   .catch(err => {
                     throw err;
                   });
  // Update invoice generation status in the cart object
  var updationResponse = await InvoiceModel.prototype.updateCartObject(email,
                                                                       invoiceData.cart.cartId,
                                                                       authToken)
                    .catch(err => {
                      throw err;
                    });
  // Return the response
  return updationResponse;
};

// Supportive function to fetch user details
InvoiceModel.prototype.fetchUserData = function(email, authToken) {
  return new Promise((resolve, reject) => {
    // Hit a GET request to user microservice to fetch user details
    request.get({
      'url' : config.microserviceUrls.userMicroservice,
      'qs' : {'id' : email},
      'headers': {
        'token' : authToken
      },
      'timeout' : 1000
    }, (err, res, body) => {
      if(!err && res.statusCode == 200) {
        // Parse the body
        var parsedBody = JSON.parse(body);
        // Resolve the promise with the parsed body
        resolve(parsedBody);
      } else if(!err && res.statusCode == 400){
        reject({'statusCode' : 400, 'body' : {'error' : 'User doesn\'t exist'}});
      } else {
        logger.error("[%s] Encountered an unexpected error while fetching user details for invoice generation, error: [%s]", email, err);
        reject({'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while fetching user details for invoice generation'}});
      }
    });
  });
};

// Supportive function for generating invoice payload
InvoiceModel.prototype.generateRequestOptions = function(userData, cart, email) {
  // Generate the auth token for Mailgun API
  var mailgunAuthToken = "api:".concat(config.mailgunApiInfo.apiKey);
  // Decode auth token to base64
  var decodedAuthToken = Buffer.from(mailgunAuthToken).toString("base64");
  // Get item names from the cart in an array
  var stringifiedItemList = cart.cartItems.join(', ');
  // Stringify the date of order
  var stringifiedDate = new Date(cart.created).toDateString();
  // Create the payload
  var payload = {
      'from' : config.mailgunApiInfo.emailSender,
      'to' : email,
      'subject' : 'Invoice',
      'template' : config.mailgunApiInfo.emailTemplateId,
      'v:firstName' : userData.firstName,
      'v:lastName' : userData.lastName,
      'v:cartId' : cart.cartId,
      'v:orderDate' : stringifiedDate,
      'v:items' : stringifiedItemList,
      'v:totalPrice' : cart.amount
    };
  // Create and return request options object
  return {
    'url': config.mailgunApiInfo.url,
    'headers' : {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Authorization' : "Basic ".concat(decodedAuthToken)
    },
    'form' : payload,
    'useQuerystring' : true,
    'timeout' : 3000
  };
};

// Supportive function to send invoice email via Mailgun API
InvoiceModel.prototype.sendEmailViaMailgun = function(email, requestOptions, cartId) {
  return new Promise((resolve, reject) => {
    // Hit a POST request to mail API to send the email
    request.post(requestOptions, (err, res, body) => {
      if(!err && res.statusCode == 200) {
        logger.info("[%s] Successfully sent the invoice email to the user at '%s' for the cart '%s'", email, email, cartId);
        resolve(body);
      } else {
        logger.error("[%s] Encountered an unexpected error while sending the invoice email, error: [%s]", email, err);
        reject({'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while sending the invoice email'}});
      }
    });
  });
};

// Supportive function for updating the invoice generation status in the concerned cart object
InvoiceModel.prototype.updateCartObject = function(email, cartId, authToken) {
  return new Promise((resolve, reject) => {
    // Hit a PUT request to order microservice to update cart object
    request.put({
      'url' : config.microserviceUrls.orderMicroservice,
      'headers' : {
        'token' : authToken
      },
      'json' : {
        'cartId' : cartId,
        'cartUpdation' : {'invoiceGenerated' : true}
      },
      'timeout' : 2000
    }, (err, res, body) => {
      if(!err && res.statusCode == 200) {
        logger.info("[%s] Updated the invoice generation status in the concerned cart object, cartId: '%s'", email, cartId);
        resolve({'statusCode' : 200, 'body' : {'body' : 'Invoice email sent successfully and updation of the same has been reflected in the concerned cart object'}});
      } else {
        logger.error("[%s] Encountered an unexpected error while updating the cart '%s' with invoice generation status, error: [%s]", email, cartId, err);
        reject({'statusCode' : 500, 'body' : {'error' : 'Invoice generated successfully but encountered an unexpected error while updating the invoice generation status in the concerned cart object'}});
      }
    });
  });
};

// Export the module
export default new InvoiceModel();
