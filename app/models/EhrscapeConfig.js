'use strict';

angular.module('ehrscapeProvisioner.ehrscapeConfig', [])

.factory('ehrscapeConfig', function() {

  return {
    baseUrl: 'https://rest.ehrscape.com/rest/v1/',
    username: '',
    password: '',
    sessionId: '',
    fullName: '',
    nhsNumber: '',
    subjectNamespace: 'uk.nhs.hospital_number',
    subjectId: '',
    ehrId: '',
    commiterName: 'ehrscapeProvisioner'
  }

});
