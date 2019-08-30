/*
*
* Deals with menu schema
*
*/

// Dependency
import mongoose from 'mongoose';

// Menu schema
var menuSchema = new mongoose.Schema({
  // Define schema properties
  'itemName' : {
    'type': 'String',
    'required' : true,
    'trim' : true
  },
   'description' : {
    'type': 'String',
    'required' : true,
    'trim' : true
  },
   'rating' : {
    'type': 'Number',
    'index' : true,
    'required' : true
  },
   'variants' : {
    'type': [{'size' : 'String', 'price' : 'Number', '_id' : false}],
    'required' : true
  },
   'category' : {
     'type': 'String',
     'required' : true,
     'trim' : true
  },
   'toppings' : {
    'type': [{'topping' : 'String', 'price' : 'Number', '_id' : false}]
  },
   'extras' : {
    'type': [{'extra' : 'String', 'price' : 'Number', '_id' : false}]
  },
  'price' : {
    'type': 'Number'
  }
});

// Export the module
export default mongoose.model('menu', menuSchema);
