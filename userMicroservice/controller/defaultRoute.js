/*
*
* Default route
*
*/

// Export the module
export default function(router) {
  router.all('/', (req, res) => {
    res.status(404).send({'body' : 'Resource not found'});
  });
  return router;
};
