// static values object that is used to store questions used for user in our API.

const staticValues = {
  age: ['0-19', '20-29', '30-39', '40-49', '50-59', '>65'],

  haveDiseaseDiagnosis: [
    'Sëmundje të frymëmarrjes/mushkërive',
    'Sëmundje të zemrës (kardiovaskulare)',
    'Diabetin',
    'Sëmundje neurologjike',
    'Asnjёra',
  ],
  hasChildrenDisease: [
    'Sëmundje të frymëmarrjes/mushkërive',
    'Sëmundje të zemrës (kardiovaskulare)',
    'Diabetin',
    'Sëmundje neurologjike',
    'Asnjёra',
  ],
  energySource: ['Qymyr', 'Gas', 'Rrymë elektrike', 'Zjarr/Dru'],
  airQuality: ['E mire', 'E pranueshme', 'Mesatare', 'E dobet', 'Shume e dobet'],
  gender: ['Mashkull', 'Femër'],
};

module.exports = staticValues;
