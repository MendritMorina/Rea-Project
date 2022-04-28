const filterValuesFromSelect = (select, removeValues) => {
  const arraySelect = select.split(',');
  const newArray = [];

  const newArraySelect = removeDuplicates(arraySelect);

  for (let i = 0; i < newArraySelect.length; i++) {
    if (notContainsValue(newArraySelect[i], removeValues)) {
      newArray.push(newArraySelect[i]);
    }
  }

  function removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  function notContainsValue(selectValue, removeValues) {
    for (let i = 0; i < removeValues.length; i++) {
      if (selectValue === removeValues[i]) {
        return false;
      }
    }
    return true;
  }

  return newArray.join(',');
};

module.exports = filterValuesFromSelect;
