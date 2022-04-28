const filterValuesFromSelect = (select, removeValues) => {
  const arraySelect = select.split(',');
  const newArray = [];

  const newArraySelect = arraySelect.filter((item, index) => arraySelect.indexOf(item) === index);

  newArraySelect.forEach((selectValue) => {
    if (!removeValues.includes(selectValue)) {
      newArray.push(selectValue);
    }
  });

  return newArray.join(' ');
};

module.exports = filterValuesFromSelect;
