var EhrscapeConfig = {
  patientsFile: 'patients1.csv',
  baseUrl: 'https://ehrscape.code-4-health.org/rest/v1/',
  username: '',
  password: '',
  sessionId: '',
  subjectNamespace: 'uk.nhs.hospital_number',
  subjectId: '',
  ehrId: '',
  templateId: 'Vital Signs Encounter (Composition)',
  compositionId: '',
  commiterName: 'ehrscapeProvisioner'
}

module.exports = EhrscapeConfig;