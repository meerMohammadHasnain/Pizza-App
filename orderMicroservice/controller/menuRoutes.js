/*
*
* Route for '/menu' path
*
*/

// Dependencies
import model from './../model/menuModel';
import validators from './../util/validator';
import utilMiddlewares from './../util/utilMiddlewares';

// Export the module
export default function(router) {

  // Get menu item
  router.get('/menu/item',
    validators.getMenuItemValidationMiddlewares(),
    utilMiddlewares.verifyAuthentication(),
    async function(req, res) {
        await model.getMenuItemById(req.query.id, req.userEmail)
          .then(response => {
            res.status(response.statusCode).send(response.body);
          })
          .catch(err => {
            res.status(err.statusCode).send(err.body);
          });
  });

  // Get menu items based on pagination for a particular category
  router.get('/menu/:category',
    validators.getCategoryMenuValidationMiddlewares(),
    utilMiddlewares.verifyAuthentication(),
    async function(req, res) {
        await model.getCategoryMenuItems(req.params.category,
                                         req.query.id,
                                         req.query.rating,
                                         req.userEmail)
          .then(response => {
            res.status(response.statusCode).send(response.body);
          })
          .catch(err => {
            res.status(err.statusCode).send(err.body);
          });
  });

  // Get menu items of all categories
  router.get('/menu', utilMiddlewares.verifyAuthentication(),
    async function(req, res) {
        await model.getMenuItems(req.userEmail)
          .then(response => {
            res.status(response.statusCode).send(response.body);
          })
          .catch(err => {
            res.status(err.statusCode).send(err.body);
          });
  });

  // Handle invalid method for the route '/menu'
  router.all('/menu', function(req, res, next) {
    if(['GET'].indexOf(req.method) == -1) {
      res.status(405).send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  // Handle invalid method for the route '/menu/item'
  router.all('/menu/item', function(req, res, next) {
    if(['GET'].indexOf(req.method) == -1) {
      res.status(405).send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  // Return the router
  return router;

};
