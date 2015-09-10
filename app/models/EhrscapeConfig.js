'use strict';

angular.module('ehrscapeProvisioner.ehrscapeConfig', [])

.factory('ehrscapeConfig', function() {

  return {
    baseUrl: 'https://ehrscape.code-4-health.org/rest/v1/',
    username: '',
    password: '',
    sessionId: '',
    fullName: '',
    nhsNumber: '',
    subjectNamespace: 'uk.nhs.hospital_number',
    subjectId: '',
    ehrId: '',
    templateId: 'Vital Signs Encounter (Composition)',
    compositionId: '',
    commiterName: 'ehrscapeProvisioner'
  }

});
