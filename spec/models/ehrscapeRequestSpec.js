var EhrscapeRequest = require('../../src/models/ehrscapeRequest');

describe("EhrscapeRequest", function() {

  var ehrscapeRequest;

  beforeEach(function() {
    ehrscapeRequest = new EhrscapeRequest({ description: 'desc', url: 'some.url', method: 'POST', requestBody: 'request-body', timeTaken: '123ms', responseBody: 'response-body', statusCode: '200' });
  });

  it("should add description", function() {
    expect(ehrscapeRequest.description).toBe('desc');
  });

  it("should add url", function() {
    expect(ehrscapeRequest.url).toBe('some.url');
  });

  it("should add method", function() {
    expect(ehrscapeRequest.method).toBe('POST');
  });

  it("should add request", function() {
    expect(ehrscapeRequest.request).toEqual({ requestBody: 'request-body', timeTaken: '123ms' });
  });

  it("should add response", function() {
    expect(ehrscapeRequest.response).toEqual({ statusCode: '200', responseBody: '"response-body"' });
  });

});