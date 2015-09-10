'use strict';

describe('ehrscapeProvisioner.Action module', function() {

  beforeEach(module('ehrscapeProvisioner.Action'));

  var myAction;
  var $httpBackend, $rootScope;

  beforeEach(inject(function(_$httpBackend_, _$rootScope_, _Action_) {
    var Action = _Action_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    $rootScope.ehrscapeConfig = { baseUrl: 'https://rest.ehrscape.com/rest/v1/' };
    myAction = new Action({
      id: 'TEST_EXAMPLE',
      name: 'Test name',
      urlExtension: 'test-extension',
      requestMethod: 'POST',
      includeSessionHeader: false
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should process http response', function() {
    myAction.processHttpResponse({status: 'Complete', responseCode: 201, responseData: { sessionId: '1234-5678-abcd-efgh'}});
    expect(myAction.status).toBe('Complete');
    expect(myAction.responseCode).toBe(201);
  });

  it('should perform http request successfully', function() {
    $httpBackend.when('POST', 'https://rest.ehrscape.com/rest/v1/test-extension').respond(201, { sessionId: '1234-5678-abcd-efgh'});
    myAction.performHttpRequest(function(result) {
      expect(myAction.status).toBe('Complete');
      expect(myAction.responseCode).toBe(201);
      expect(myAction.startTime).not.toBe(0);
      expect(myAction.endTime).not.toBe(0);
      expect(myAction.responseBody).toEqual({ sessionId: '1234-5678-abcd-efgh'});
      expect(result).toEqual({ sessionId: '1234-5678-abcd-efgh'});
    });
    $httpBackend.flush();
  });

  it('should perform http request with failure', function() {
    $httpBackend.when('POST', 'https://rest.ehrscape.com/rest/v1/test-extension').respond(401, { status: 401, code: 'SYS-9401', userMessage: 'Could not authenticate the user' });
    myAction.performHttpRequest(function() {}, function(result) {
      expect(myAction.status).toBe('Failed');
      expect(myAction.responseCode).toBe(401);
      expect(myAction.startTime).not.toBe(0);
      expect(myAction.endTime).not.toBe(0);
      expect(myAction.responseBody).toEqual({ status: 401, code: 'SYS-9401', userMessage: 'Could not authenticate the user' });
      expect(result).toEqual({ status: 401, code: 'SYS-9401', userMessage: 'Could not authenticate the user' });
    });
    $httpBackend.flush();
  });

  it('should have default values when initialised', function() {
    expect(myAction.id).toBe('TEST_EXAMPLE');
    expect(myAction.name).toBe('Test name');
    expect(myAction.urlExtension).toBe('test-extension');
    expect(myAction.urlParams).toEqual([]);
    expect(myAction.includeSessionHeader).toBe(false);
    expect(myAction.requestMethod).toBe('POST');
    expect(myAction.requestHeaders).toEqual([]);
    expect(myAction.requestBody).toBe('');
    expect(myAction.status).toBe('Not started');
    expect(myAction.responseCode).toBe('');
    expect(myAction.responseBody).toBe('');
    expect(myAction.startTime).toBe(0);
    expect(myAction.endTime).toBe(0);
  });

  it('should have a full URL without parameters', function() {
    expect(myAction.getFullUrl(false)).toBe('https://rest.ehrscape.com/rest/v1/test-extension');
  });

  it('should show results relative to status', function() {
    expect(myAction.showResults()).toBe(false);
    myAction.status = 'Pending';
    expect(myAction.showResults()).toBe(false);
    myAction.status = 'Complete';
    expect(myAction.showResults()).toBe(true);
    myAction.status = 'Failed';
    expect(myAction.showResults()).toBe(true);
  });

  it('should defined status class relative to status', function() {
    expect(myAction.getStatusClass()).toBe('secondary');
    myAction.status = 'Pending';
    expect(myAction.getStatusClass()).toBe('');
    myAction.status = 'Complete';
    expect(myAction.getStatusClass()).toBe('success');
    myAction.status = 'Failed';
    expect(myAction.getStatusClass()).toBe('alert');
  });

  it('should calculate time taken', function() {
    myAction.startTime = 1000;
    myAction.endTime = 2500;
    expect(myAction.getTimeTaken()).toEqual(1500);
  });

  describe('url parameters', function() {

    var urlParams = [{name: 'param1', value: 'value1'}, {name: 'param2', value: 'value2'}];

    beforeEach(function() {
      myAction.setUrlParameters(urlParams);
    });

    it('should be allowed to be set', function() {
      expect(myAction.urlParams).toEqual(urlParams);
    });

    it('should construct parameters for URL', function() {
      expect(myAction.constructUrlParameters(false)).toBe('?param1=value1&param2=value2');
    });

    it('should construct parameters with line breaks for URL', function() {
      expect(myAction.constructUrlParameters(true)).toBe('?param1=value1&\nparam2=value2');
    });

    it('should construct encoded parameters for URL', function() {
      myAction.setUrlParameters([{name: 'password', value: 'abcd#1234'}]);
      expect(myAction.constructUrlParameters(false)).toBe('?password=abcd%231234');
    });

    it('should not construct anything when parameters are not set', function() {
      myAction.setUrlParameters([]); 
      expect(myAction.constructUrlParameters(false)).toBe('');
    });

    it('should have a full URL including parameters', function() {
      expect(myAction.getFullUrl()).toBe('https://rest.ehrscape.com/rest/v1/test-extension?param1=value1&param2=value2');
    });

    it('should have a full URL including parameters with line breaks', function() {
      expect(myAction.getFullUrl(true)).toBe('https://rest.ehrscape.com/rest/v1/test-extension?param1=value1&\nparam2=value2');
    });

  });

  describe('headers', function() {

    var headers = [{name: 'Content-Type', value: 'application/json'}];
    beforeEach(function() {
      myAction.requestHeaders = headers;
    });

    it('should construct headers', function() {
      var expected = {'Content-Type': 'application/json'};
      expect(myAction.getHeaders()).toEqual(expected);
    });

    it('should construct headers with session Id', function() {
      myAction.includeSessionHeader = true;
      $rootScope.ehrscapeConfig.sessionId = '1234-5678-abcd-efgh';
      var expected = {'Ehr-Session': '1234-5678-abcd-efgh', 'Content-Type': 'application/json'};
      expect(myAction.getHeaders()).toEqual(expected);
    });

  });

});



