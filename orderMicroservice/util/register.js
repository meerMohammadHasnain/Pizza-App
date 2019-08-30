/*
*
*  Deals with the registration of microservice in Consul
*
*/

//Dependencies
import {config} from 'config';
import url from 'url';
import request from 'request';
import logger from './logger';

// Container function for utility middlewares
var Register = function() {};

// Register the microservice
Register.prototype.registerService = function(protocol, port, serviceName, serviceId) {
  // Creating request options object to hit Consul API
  var requestOptions = this.createRequestOptions(protocol, port, serviceName, serviceId);
  // Hitting Consul API to register the service
  this.hitConsulApi(requestOptions)
       .then(response => {
         logger.info("HTTPS service instance registered successfully in Consul, serviceID: %s", serviceId);
       }, err => {
         logger.warn("Could not register the HTTPS service instance in Consul, skipping it");
       })
       .catch(err => {
         logger.warn("Could not register the HTTPS service instance in Consul, skipping it");
       });
};

// Send the request to Consul API
Register.prototype.hitConsulApi = function(requestOptions) {
  return new Promise((resolve, reject) => {
    // Hit a PUT request to Consul API to register the service
    request.put(requestOptions, (err, res, body) => {
      if(!err) {
        if(res.statusCode == 200) {
          resolve();
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
  });
};

// Create the request options
Register.prototype.createRequestOptions = function(protocol, port, serviceName, serviceId) {
  var consulUrl = url.format({
    'protocol' : config.consulInfo.protocol,
    'hostname' : config.consulInfo.consulHost,
    'port' : config.consulInfo.consulPort,
    'pathname' : config.consulInfo.apiPath
  });
  var serviceUrl = url.format({
    'protocol' : protocol,
    'hostname' : config.host,
    'port' : port,
    'pathname' : '/heartbeat'
  });
  return {
    'url' : consulUrl,
    'json' : {
      'ID' : serviceId,
      'Name' : serviceName,
      'Address': config.host,
      'Port': port,
      'Check': {
       'ID': "api",
       'Name': 'service_heartbeat_check',
       'HTTP': serviceUrl,
       'Method': "GET",
       'Interval': "30s",
       'Timeout': "2s",
       'DeregisterCriticalServiceAfter': "10s"
     }
   },
   'timeout' : 2000
  };
};

// Export the module
export default new Register();
