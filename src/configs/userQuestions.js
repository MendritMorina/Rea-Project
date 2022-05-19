// Questions object that is used to store questions used for user in our API.

const questions = {
  age: ['0-19', '20-29', '30-39', '40-49', '50-59', '>65'],
  haveDiseaseDiagnosis: [
    'Semundjet te frymarrjes/mushkerive',
    'Semundje te zemres (kardiovaskulare)',
    'Diabetin',
    'Semundje neurologjike',
  ],
  energySource: ['Qymyr', 'Gas', 'Rryme elektrike', 'Zjarr/dru'],
  hasChildrenDisease: [
    'Semundjet te frymarrjes/mushkerive',
    'Semundje te zemres (kardiovaskulare)',
    'Diabetin',
    'Semundje neurologjike',
  ],
  //   gender: ['Mashkull', 'Femer'],
  //   hasChildren: ['Po', 'Jo'],
  //   isPregnant: ['Po', 'Jo'],
  //   hasChildren: [true, false],
  //   isPregnant: [true, false],
};

module.exports = questions;
