var Patient = require('../../src/models/patient');

describe("Patient", function() {

  var patient;

  beforeEach(function() {
    patient = new Patient([
      1,
      'Mr',
      'John',
      'Doe',
      '123 High Street',
      'Village',
      'Townsville',
      'AB12 3CD',
      '01234 567890',
      '06/06/1944',
      'Male',
      '1234567890',
      '987654321',
    ]);
  });

  it("should get the address", function() {
    expect(patient.getAddress()).toBe('123 High Street, Village, Townsville, AB12 3CD');
  });

  it("should get the gender", function() {
    expect(patient.getGender()).toBe('MALE');
  });

  it("should get the subject id", function() {
    expect(patient.getSubjectId()).toBe('1234567890');
  });

  it("should get the subject id", function() {
    expect(patient.getDob(false)).toBe('1944-06-06T00:00:00.000+01:00');
  });

  it("should return patient as json", function() {
    expect(patient.toJSON()).toBe('{"address":{"address":"123 High Street, Village, Townsville, AB12 3CD"},"dateOfBirth":"1944-06-06T00:00:00.000+01:00","firstNames":"John","gender":"MALE","lastNames":"Doe","partyAdditionalInfo":[{"key":"title","value":"Mr"},{"key":"uk.nhs.hospital_number","value":"1234567890"}]}');
  });

});