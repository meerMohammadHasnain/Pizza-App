/*
*
* Routes for '/invoice' path
*
*/

// Dependencies
import model from './../model/invoiceModel';
import validators from './../util/validator';
import utilMiddlewares from './../util/utilMiddlewares';

// Export the module
export default function(router) {

  // Create a user
  router.post('/invoice', validators.generateInvoiceValidationMiddlewares(),
     utilMiddlewares.verifyAuthentication(),
     async function(req, res) {
        await model.generateInvoice(req.body, req.userEmail, req.headers.token)
             .then(response => {
               res.status(response.statusCode).send(response.body);
             })
             .catch(err => {
               res.status(err.statusCode).send(err.body);
             });
  });

  // Handle invalid method
  router.all('/invoice', function(req, res, next) {
    if(['POST'].indexOf(req.method) == -1) {
      res.status(405).send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  // Return the router
  return router;

};
