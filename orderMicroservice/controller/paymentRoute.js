/*
*
* Route for '/payment' path
*
*/

// Dependencies
import model from './../model/paymentModel';
import validators from './../util/validator';
import utilMiddlewares from './../util/utilMiddlewares';

// Export the module
export default function(router) {

  // Make a payment
  router.post('/payment', validators.makePaymentValidationMiddlewares(),
    utilMiddlewares.verifyAuthentication(),
    async function(req, res) {
       await model.makePayment(req.secure,
                               req.headers.host,
                               req.body,
                               req.userEmail,
                               req.headers.token)
          .then(response => {
            res.status(response.statusCode).send(response.body);
          })
          .catch(err => {
            res.status(err.statusCode).send(err.body);
          });
  });

  // Handle invalid method
  router.all('/payment', function(req, res, next) {
    if(['POST'].indexOf(req.method) == -1) {
      res.status(405).send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  // Return the router
  return router;

};
