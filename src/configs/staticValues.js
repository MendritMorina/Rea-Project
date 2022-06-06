// static values object that is used to store questions used for user in our API.

const staticValues = {
  age: ['0-19', '20-29', '30-39', '40-49', '50-59', '>65'],
  // hasDiseaseDiagnosis: [
  //   'Semundjet te frymarrjes/mushkerive',
  //   'Semundje te zemres (kardiovaskulare)',
  //   'Diabetin',
  //   'Semundje neurologjike',
  // ],
  haveDiseaseDiagnosis: [
    'Semundjet te frymarrjes/mushkerive',
    'Semundje te zemres (kardiovaskulare)',
    'Diabetin',
    'Semundje neurologjike',
  ],
  hasChildrenDisease: [
    'Semundjet te frymarrjes/mushkerive',
    'Semundje te zemres (kardiovaskulare)',
    'Diabetin',
    'Semundje neurologjike',
  ],
  energySource: ['Qymyr', 'Gas', 'Rryme elektrike', 'Zjarr/dru'],
  airQuality: ['E mire', 'E pranueshme', 'Mesatare', 'E dobet', 'Shume e dobet'],
  gender: ['Male', 'Female'],
};

module.exports = staticValues;
