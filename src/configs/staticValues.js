// static values object that is used to store questions used for user in our API.

const staticValues = {
  age: ['0-19', '20-29', '30-39', '40-49', '50-59', '60 <'],
  haveDiseaseDiagnosis: [
    'Sëmundje të mushkërive',
    'Sëmundje kardiovaskulare',
    'Diabet',
    'Sëmundje neurologjike',
    'Nuk kam ndonjë diagnozë',
  ],
  hasChildrenDisease: [
    'Sëmundje të mushkërive',
    'Sëmundje kardiovaskulare',
    'Diabet',
    'Sëmundje neurologjike',
    'Nuk ka ndonjë diagnozë',
  ],
  energySource: ['Qymyr', 'Dru', 'Gaz', 'Tjetër'],
  airQuality: ['E mirë', 'E pranueshme', 'Mesatare', 'E dobët', 'Shume e dobët', 'Jashtëzakonisht e dobët'],
  gender: ['Mashkull', 'Femër'],
};

module.exports = staticValues;
