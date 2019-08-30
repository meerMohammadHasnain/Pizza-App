/*
*
* Routes for '/users' path
*
*/

// Dependencies
import model from './../model/userModel';
import validators from './../util/validator';
import utilMiddlewares from './../util/utilMiddlewares';

// Export the module
export default function(router) {

  // Create a user
  router.post('/users', validators.createUserValidationMiddlewares(),
     async function(req, res) {
        await model.createUser(req.body)
             .then(response => {
               res.status(response.statusCode).send(response.body);
             })
             .catch(err => {
               res.status(err.statusCode).send(err.body);
             });
  });

  // Retrieve a user
  router.get('/users', validators.getUserValidationMiddlewares(),
     utilMiddlewares.verifyAuthentication(),
     async function(req, res) {
        await model.getUser(req.query.id)
             .then(response => {
               res.status(response.statusCode).send(response.body);
             })
            .catch(err => {
               res.status(err.statusCode).send(err.body);
             });
  });

  // Update a user
  router.put('/users', validators.updateUserValidationMiddlewares(),
     utilMiddlewares.verifyAuthentication(),
     async function(req, res) {
        await model.updateUser(req.body, req.userEmail)
             .then(response => {
               res.status(response.statusCode).send(response.body);
             })
             .catch(err => {
               res.status(err.statusCode).send(err.body);
             });
  });

  // Delete a user
  router.delete('/users', validators.deleteUserValidationMiddlewares(),
     utilMiddlewares.verifyAuthentication(),
     async function(req, res) {
         await model.deleteUser(req.query.id, req.headers.token)
             .then(response => {
               res.status(response.statusCode).send(response.body);
             })
             .catch(err => {
               res.status(err.statusCode).send(err.body);
             });
  });

  // Handle invalid method
  router.all('/users', function(req, res, next) {
    if(['POST', 'GET', 'PUT', 'DELETE'].indexOf(req.method) == -1) {
      res.status(405).send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  // Return the router
  return router;

};
