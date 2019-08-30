/*
*
* Route for '/cart' path
*
*/

// Dependencies
import model from './../model/cartModel';
import validators from './../util/validator';
import utilMiddlewares from './../util/utilMiddlewares';

// Export the module
export default function(router) {

  // Create a cart
  router.post('/cart', validators.createCartValidationMiddlewares(),
    utilMiddlewares.verifyAuthentication(),
    async function(req, res) {
       await model.createCart(req.body, req.userEmail, req.headers.token)
          .then(response => {
            res.status(response.statusCode).send(response.body);
          })
          .catch(err => {
            res.status(err.statusCode).send(err.body);
          });
  });

  // Retrieve a cart
  router.get('/cart', validators.getCartValidationMiddlewares(),
    utilMiddlewares.verifyAuthentication(),
    async function(req, res) {
        await model.getCart(req.query.id, req.headers.token)
          .then(response => {
            res.status(response.statusCode).send(response.body);
          })
          .catch(err => {
            res.status(err.statusCode).send(err.body);
          });
  });

  // Update a cart
  router.put('/cart', validators.updateCartValidationMiddlewares(),
    utilMiddlewares.verifyAuthentication(),
    async function(req, res) {
        await model.updateCart(req.query.id, req.body, req.userEmail)
          .then(response => {
            res.status(response.statusCode).send(response.body);
          })
          .catch(err => {
            res.status(err.statusCode).send(err.body);
          });
  });

  // Delete a cart by cartId
  router.delete('/cart', validators.deleteCartValidationMiddlewares(),
    utilMiddlewares.verifyAuthentication(),
    async function(req, res) {
        await model.deleteCart(req.query.id, req.userEmail)
          .then(response => {
            res.status(response.statusCode).send(response.body);
          })
          .catch(err => {
            res.status(err.statusCode).send(err.body);
          });
  });

  // Delete all the carts of a user by email
  router.delete('/carts', validators.deleteUserCartsValidationMiddlewares(),
    utilMiddlewares.verifyAuthentication(),
    async function(req, res) {
        await model.deleteCarts(req.query.id, req.userEmail)
          .then(response => {
            res.status(response.statusCode).send(response.body);
          })
          .catch(err => {
            res.status(err.statusCode).send(err.body);
          });
  });

  // Update payment status in a cart
  router.put('/cart/invoice', validators.updateInvoiceGenerationValidationMiddlewares(),
    utilMiddlewares.verifyAuthentication(),
    async function(req, res) {
        await model.updateInvoiceGenerationStatus(req.body, req.userEmail)
          .then(response => {
            res.status(response.statusCode).send(response.body);
          })
          .catch(err => {
            res.status(err.statusCode).send(err.body);
          });
  });


  // Handle invalid methods for '/cart' route
  router.all('/cart', function(req, res, next) {
    if(['POST', 'GET', 'PUT', 'DELETE'].indexOf(req.method) == -1) {
      res.status(405).send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  // Handle invalid methods for '/carts' route
  router.all('/carts', function(req, res, next) {
    if(['DELETE'].indexOf(req.method) == -1) {
      res.status(405).send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  // Handle invalid methods for '/cart/invoice' route
  router.all('/cart/invoice', function(req, res, next) {
    if(['PUT'].indexOf(req.method) == -1) {
      res.status(405).send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  // Return the router
  return router;

};
