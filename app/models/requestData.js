'use strict';

angular.module('ehrscapeProvisioner.requestData', [])

.factory('postPartyRequestBody', function($http) {

  return {
    get: function(callback) {
      console.log('postPartyRequestBody');
      $http.get('/data/party.json').success(function(data) {
        callback(data);
      });
    }
  };

})

.factory('postTemplateRequestBody', function($http) {

  return {
    get: function(callback) {
      console.log('postTemplateRequestBody');
      $http.get('/data/vital-signs-template.xml').success(function(data) {
        callback(data);
      });
    }
  };

});
