var request = require('request');
var Q = require('q');

function promisedRequest(requestData) {
  var deferred = Q.defer();
  requestData.json = true;
  if(!requestData.method) {
    requestData.method = 'GET';
  }

  request(requestData, function(err, resp, data) {
    if(err) {
      deferred.reject(err);
    } else {
      if(resp.statusCode >= 200 && resp.statusCode <=299) {
        deferred.resolve(data);
      } else if(requestData.method == 'DELETE' && resp.statusCode == 404) {
        deferred.resolve();
      } else {
        var message = resp.headers['reason'];
        if(!message) {
          message = data;
        }

        deferred.reject(new Error(message));
      }
    }
  });
  return deferred.promise;
}

module.exports = promisedRequest;
