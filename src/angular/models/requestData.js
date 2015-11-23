'use strict';

angular.module('ehrscapeProvisioner.requestData', [])

.factory('postPartyRequestBody', function($http) {

  return {
    get: function(callback) {
      $http.get('/data/party.json').success(function(data) {
        callback(data);
      });
    }
  };

})

.factory('postTemplateRequestBody', function($http) {

  return {
    get: function(callback) {
      $http.get('/data/vital-signs/vital-signs-template.xml').success(function(data) {
        callback(data);
      });
    }
  };

})

.factory('postCompositionRequestBody', function($http) {

  return {
    get: function(callback) {
      $http.get('/data/vital-signs/vital-signs-composition.json').success(function(data) {
        callback(data);
      });
    }
  };

});
