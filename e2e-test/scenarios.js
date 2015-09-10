'use strict';

describe('Ehrscape provisioner app', function() {

  beforeEach(function() {
    browser.get('/');
    browser.wait(function(){
      return browser.driver.isElementPresent(by.id('go-button'));
    }, 30000);
  });

  it('should allow editing of base URL', function() {
    var baseUrlInput = element(by.model('ehrscapeConfig.baseUrl'));
    expect(baseUrlInput.getAttribute('readonly')).toBe('true');
    browser.actions().doubleClick(element(by.model('ehrscapeConfig.baseUrl'))).perform();
    expect(baseUrlInput.getAttribute('readonly')).toBe(null);
    browser.actions().doubleClick(element(by.model('ehrscapeConfig.username'))).perform();
    expect(baseUrlInput.getAttribute('readonly')).toBe('true');
  });

  it('should load up with default config', function() {
    expect(element(by.model('ehrscapeConfig.baseUrl')).getAttribute('value')).toBe('https://ehrscape.code-4-health.org/rest/v1/');
    expect(element(by.model('ehrscapeConfig.subjectNamespace')).getAttribute('value')).toBe('uk.nhs.hospital_number');
  });

  it('should load up with default actions and buttons', function() {
    expect(element.all(by.css('.action-list tbody tr')).count()).toBe(5);
    expect(element.all(by.css('.request-header')).count()).toBe(5);
    expect(element(by.id('go-button'))).toBeDefined();
    expect(element(by.id('reset-button'))).toBeDefined();
  });

  it('should error when authentication not entered', function() {
    element(by.id('go-button')).click();
    browser.wait(function(){
      return browser.driver.isElementPresent(by.css('.sweet-alert.visible'));
    }, 30000);
    expect(element(by.css('.sweet-alert.visible h2')).getText() ).toBe('Error');
    expect(element.all(by.css('.sweet-alert.visible p')).first().getText() ).toBe('Please enter username and password');
  });

  it('should error when authentication is incorrect', function() {
    element(by.model('ehrscapeConfig.username')).sendKeys('myUsername');
    element(by.model('ehrscapeConfig.password')).sendKeys('myPassword');
    element(by.id('go-button')).click();
    browser.wait(function(){
      return browser.driver.isElementPresent(by.css('.sweet-alert.visible'));
    }, 30000);
    expect(element(by.css('.sweet-alert.visible h2')).getText() ).toBe('Error');
    expect(element.all(by.css('.sweet-alert.visible p')).first().getText() ).toBe('Authentication failed, please check the username and password.');
  });

});
