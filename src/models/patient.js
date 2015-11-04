var moment = require('moment');
var EhrscapeConfig = require('../models/ehrscapeConfig');

var Patient = function(data) {
  this.data = data;
}

Patient.KEY_INDEX = 0;
Patient.TITLE_INDEX = 1;
Patient.FIRST_NAME_INDEX = 2;
Patient.LAST_NAME_INDEX = 3;
Patient.ADDRESS_LINE1_INDEX = 4;
Patient.ADDRESS_LINE2_INDEX = 5;
Patient.ADDRESS_LINE3_INDEX = 6;
Patient.POSTCODE_INDEX = 7;
Patient.TELEPHONE_INDEX = 8;
Patient.DOB_INDEX = 9;
Patient.GENDER_INDEX = 10;
Patient.NHS_NUMBER_INDEX = 11;
Patient.PAS_NUMBER_INDEX = 12;

Patient.prototype.toJSON = function(prettyPrint) {
  var indent = prettyPrint ? 2 : 0;
  var party = {
    address: {
      address: this.getAddress(),
    },
    dateOfBirth: this.getDob(),
    firstNames: this.data[Patient.FIRST_NAME_INDEX],
    gender: this.getGender(),
    lastNames: this.data[Patient.LAST_NAME_INDEX],
    partyAdditionalInfo: [
      {
        key: "title",
        value: this.data[Patient.TITLE_INDEX]
      },
      {
        key: EhrscapeConfig.subjectNamespace,
        value: this.getSubjectId()
      }
    ]
  };
  return JSON.stringify(party, null, indent);
};

Patient.prototype.getAddress = function() {
  var address = [this.data[Patient.ADDRESS_LINE1_INDEX], this.data[Patient.ADDRESS_LINE2_INDEX], this.data[Patient.ADDRESS_LINE3_INDEX], this.data[Patient.POSTCODE_INDEX]];
  return address.join(', ');
};

Patient.prototype.getGender = function() {
  return this.data[Patient.GENDER_INDEX].toUpperCase();
};

Patient.prototype.getSubjectId = function() {
  return this.data[Patient.NHS_NUMBER_INDEX];
};

Patient.prototype.getDob = function() {
  var dob = moment(this.data[Patient.DOB_INDEX], "DD/MM/YYYY");
  // console.log(dob.date());
  // console.log(dob.format('YYYY-MM-DDT00:00:00.000Z'));
  return dob.format('YYYY-MM-DDT00:00:00.000Z');
};

module.exports = Patient;