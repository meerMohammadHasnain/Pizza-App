/*
*
* Model for menu entity
*
*/

// Dependencies
import menuDataAccess from './../accessor/menuDataAccess';
import Model from './../schema/menuSchema';
import logger from './../util/logger';

// Container function for model
var MenuModel = function() {};

// Model function for getting first few menu items of each category
MenuModel.prototype.getMenuItems = async function(email) {
  // Connect to the database
  await menuDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]",email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while fetching the menu items'}};
      });
  // Get veg menu items
  var vegItems = await menuDataAccess.getMenuItems({'category' : 'veg'}, {'itemName' : 1, 'description' : 1, 'rating' : 1}, {'rating' : -1, '_id' : 1}, 5)
      .catch(err => {
        logger.error("[%s] Encountered an unexpected error while fetching the menu items, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while while fetching the menu items'}};
      });
  // Get non-veg menu items
  var nonVegItems = await menuDataAccess.getMenuItems({'category' : 'nonveg'}, {'itemName' : 1, 'description' : 1, 'rating' : 1}, {'rating' : -1, '_id' : 1}, 5)
       .catch(err => {
        logger.error("[%s] Encountered an unexpected error while fetching the menu items, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while while fetching the menu items'}};
      });
  // Get beverages
  var beverages = await menuDataAccess.getMenuItems({'category' : 'beverages'}, {'itemName' : 1, 'description' : 1, 'rating' : 1}, {'rating' : -1, '_id' : 1}, 5)
       .catch(err => {
        logger.error("[%s] Encountered an unexpected error while fetching the menu items, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while fetching the menu items'}};
      });
  // Close the database connection
  await menuDataAccess.closeDatabase()
       .catch(err => {
         logger.warn("Could not close the database connection");
       });
  logger.info("[%s] Fetched the menu items of all categories successfully", email);
  // Return the response
  return {
    'statusCode' : 200,
    'body' : {
      'vegItems' : vegItems,
      'nonVegItems' : nonVegItems,
      'beverages' : beverages
    }
  };
};

// Model function for getting menu items of a particular category based on pagination
MenuModel.prototype.getCategoryMenuItems = async function(category, lastMenuItemId, lastRating, email) {
  // Connect to the database
  await menuDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while fetching the menu items'}};
      });
  // Create the filer for pagination
  var filter = lastMenuItemId ? {
      'category' : category,
      '$or' : [
        {'rating' : {'$eq' : lastRating}, '_id' : {'$gt' : lastMenuItemId}},
        {'rating' : {'$lt' : lastRating}}
      ]
    } : {'category' : category};
  // Get menu items from the database
  var menuItems = await menuDataAccess.getMenuItems(filter, {'itemName' : 1, 'description' : 1, 'rating' : 1}, {'rating' : -1, '_id' : 1}, 10)
      .catch(err => {
        logger.error("[%s] Encountered an unexpected error while fetching %s menu items, error: [%s]", email, category, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while fetching menu items'}};
      });
  // Close the database connection
  await menuDataAccess.closeDatabase()
        .catch(err => {
          logger.warn("Could not close the database connection");
        });
  logger.info("[%s] Fetched %s menu items successfully", email, category);
  // Return the response
  return {
    'statusCode' : 200,
    'body' : menuItems
  };
};

// Model function for getting a particular menu item by its id
MenuModel.prototype.getMenuItemById = async function(itemId, email) {
  // Connect to the database
  await menuDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", email, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while fetching the menu item'}};
      });
  // Get the menu item from the database
  var menuItem = await menuDataAccess.getMenuItemById({'_id' : itemId})
      .catch(err => {
        logger.error("[%s] Encountered an unexpected error while fetching the menu items, itemId: %s, error: [%s]", email, itemId, err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while fetching the menu item'}};
      });
  // Close the database connection
  await menuDataAccess.closeDatabase()
       .catch(err => {
        logger.warn("Could not close the database connection");
       });
  if(!menuItem) {
    throw {'statusCode' : 400, 'body' : {'error' : 'Menu Item doesn\'t exist'}};
  }
  logger.info("[%s] Fetched menu item successfully, itemId: %s", email, itemId);
  // Return the response
  return {
    'statusCode' : 200,
    'body' : menuItem
  }
};

// @TODO: This model function is just for ease of inserting menu items in the database.
// It Should be removed before pushing the code to Github.
MenuModel.prototype.insertMenuItem = async function(menuItemData) {
  // Connect to the database
  await menuDataAccess.connectDatabase()
      .catch(err => {
        logger.error("[%s] Could not connect to the database, error: [%s]", err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while saving the menu item'}};
      });
  // Insert the menu item document into the database
  var response = await menuDataAccess.insertMenuItem(menuItemData)
       .catch(err => {
        logger.error("[%s] Encountered an unexpected error while saving the menu item, error: [%s]", err);
        throw {'statusCode' : 500, 'body' : {'error' : 'Encountered an unexpected error while saving the menu item'}};
      });
  // Return the response
  return {
   'statusCode' : 201,
   'body' : response
  };
};

// Export the module
export default new MenuModel();
