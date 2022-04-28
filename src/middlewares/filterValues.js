const filterValuesFromSelect = (select, removeValues) => {
  const arraySelect = select.split(',');
  const newArray = [];

  const newArraySelect = removeDuplicates(arraySelect);

  newArraySelect.forEach((selectValue) => {
    if (!removeValues.includes(selectValue)) {
      newArray.push(selectValue);
    }
  });

  function removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  return newArray.join(',');
};

module.exports = filterValuesFromSelect;
