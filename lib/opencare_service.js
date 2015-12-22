var underlyingRequest = require('./request_helper');
var Q = require('q'),
    _ = require('underscore');

var opencareHost = 'https://challenge.opencare.com';

var argsToParams = function(args) {
  var paramList = _.map(args, function(value, key) { return key + '=' + value; });
  return paramList.join('&');
};

function buildUrl() {
  if (arguments.length > 1)
  {
    var params = argsToParams(arguments[1]);
    var url = [opencareHost, arguments[0]].join('/');
    return [url, params].join('?');
  }

  return [opencareHost].concat(Array.prototype.slice.call(arguments, 0)).join('/');
}

function request(options) {
  return underlyingRequest(options);
}

module.exports = {
  startChallenge: function() {
    return request({
      url: buildUrl('start')
    });
  },
  getLocation: function(location, nucleotide, id) {
    return request({
      url: buildUrl('location', { location: location, nucleotide: nucleotide, uniq: id })
    });
  },
  checkSequences: function(sequences, id) {
    return request({
      url: buildUrl('check'),
      method: 'POST',
      body: { sequences: sequences, uniq: id }
    });
  }
};
