'use strict';

describe('ehrscapeProvisioner.home module', function() {

  beforeEach(module('ehrscapeProvisioner.home'));

  var $controller;
  function Action(props) {
    this.id = props.id;
  };
  Action.prototype.getTimeTaken = function() {
    return 100;
  };
  Action.prototype.performHttpRequest = function(success, failure) {
    var response;
    if (this.id === 'LOGIN') {
      response = {"sessionId": "afff6523-1f3c-45f2-8ad1-49bdd5dc6d39"};
    }
    if (this.id === 'CREATE_PATIENT') {
      response = {
        "meta": {
          "href": "https://rest.ehrscape.com/rest/v1/demographics/party/67843"
        },
        "action": "CREATE"
      };
    }
    if (this.id === 'CREATE_EHR') {
      response = {
        "meta": {
          "href": "https://rest.ehrscape.com/rest/v1/ehr/21e83644-578f-422d-847e-c63919aa5480"
        },
        "action": "CREATE",
        "ehrId": "21e83644-578f-422d-847e-c63919aa5480"
      };
    }
    success(response);
  }

  var ehrscapeConfig = {
    baseUrl: 'https://rest.ehrscape.com/rest/v1/',
    username: 'test',
    password: 'pwd',
    sessionId: '1234-5678-abcd-efgh',
    subjectNamespace: 'uk.nhs.nhsnumber',
    subjectId: '12345',
    ehrId: '9876-5432-hijk-lmno',
    commiterName: 'ehrscapeProvisioner'
  };

  beforeEach(inject(function(_$controller_) {
    $controller = _$controller_;
  }));

  describe('home controller', function() {

    var $rootScope, $scope, controller;

    beforeEach(function() {
      $rootScope = { ehrscapeConfig: { baseUrl: 'https://rest.ehrscape.com/rest/v1/' } };
      $scope = {};
      controller = $controller('HomeCtrl', { $rootScope: $rootScope, $scope: $scope, Action: Action, ehrscapeConfig: ehrscapeConfig });
    });

    it('should add config to root scope', function() {
      expect($rootScope.ehrscapeConfig.baseUrl).toBe('https://rest.ehrscape.com/rest/v1/');
      expect($rootScope.ehrscapeConfig.username).toBe('test');
      expect($rootScope.ehrscapeConfig.password).toBe('pwd');
      expect($rootScope.ehrscapeConfig.sessionId).toBe('1234-5678-abcd-efgh');
      expect($rootScope.ehrscapeConfig.subjectNamespace).toBe('uk.nhs.nhsnumber');
      expect($rootScope.ehrscapeConfig.subjectId).toBe('12345');
      expect($rootScope.ehrscapeConfig.ehrId).toBe('9876-5432-hijk-lmno');
      expect($rootScope.ehrscapeConfig.commiterName).toBe('ehrscapeProvisioner');
    });

    it('should process http requests and record results', function() {
      expect($scope.showTotalProgressAndTime()).toBe(false);
      expect($scope.getPercentComplete()).toEqual('0%');
      $scope.start();
      expect($scope.showTotalProgressAndTime()).toBe(false);
      expect($scope.getPercentComplete()).toEqual('100%');
      expect($scope.getTotalTimeTaken()).toEqual(300);
      expect($rootScope.ehrscapeConfig.sessionId).toBe('afff6523-1f3c-45f2-8ad1-49bdd5dc6d39');
      expect($rootScope.ehrscapeConfig.subjectId).toBe('67843');
      expect($rootScope.ehrscapeConfig.ehrId).toBe('21e83644-578f-422d-847e-c63919aa5480');
    });

    it('should generate a url to download the workspace markdown', function() {
      expect($scope.generateMarkdownDownloadUrl()).toBe('/download/workspace-markdown?baseUrl=https://rest.ehrscape.com/rest/v1/&username=test&password=pwd&sessionId=afff6523-1f3c-45f2-8ad1-49bdd5dc6d39&subjectNamespace=uk.nhs.nhsnumber&subjectId=67843&ehrId=21e83644-578f-422d-847e-c63919aa5480&commiterName=ehrscapeProvisioner&fullName=Steve%20Walford&nhsNumber=7430555&');
    });

  });

});