/*
*
* Heartbeat route to check health status of the microservice
*
*/

// Export the module
export default function(router) {

  // Get the status of the microservice
  router.get('/heartbeat', (req, res) => {
    res.sendStatus(200);
  });

  // Handle invalid method
  router.all('/heartbeat', function(req, res, next) {
    if(['GET'].indexOf(req.method) == -1) {
      res.status(405).send({'body' : 'Method not allowed'});
    } else {
      next();
    }
  });

  //Return the router
  return router;
};
