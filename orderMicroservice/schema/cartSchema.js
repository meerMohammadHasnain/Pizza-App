/*
*
* Deals with cart schema
*
*/

// Dependency
import mongoose from 'mongoose';

// Cart schema
var cartSchema = new mongoose.Schema({
  // Define schema properties
  'email' : {
    'type': 'String',
    'required' : true,
    'trim' : true
  },
   'items' : {
    'type': [{
       'menuItemId' : {'type' : 'String',  'required' : true, 'trim' : true},
       'itemName' : {'type' : 'String', 'required' : true, 'trim' : true},
       'quantity' : {'type' : 'Number', 'required' : true},
       'customization' : {
           'size' : {'type' : 'String'},
           'basePrice': {'type' : 'Number'},
           'toppings' : {'type' : [{'name': 'String', 'price': 'Number', '_id' : false}]},
           'extras' : {'type' : [{'name': 'String', 'price': 'Number', '_id' : false}]}
       },
       'itemPrice': {'type' : 'Number', 'required' : true},
       '_id' : false
     }],
    'required' : true
  },
   'amount' : {
    'type': 'Number',
    'required' : true
  },
   'created' : {
    'type' : 'Date',
    'default' : Date.now(),
    'required' : true
  },
   'paymentStatus' : {
    'type' : 'Boolean',
    'required' : true
  },
   'invoiceGenerated' : {
    'type' : 'Boolean',
    'required' : 'true'
  }
});

// Export the module
export default mongoose.model('cart', cartSchema);
