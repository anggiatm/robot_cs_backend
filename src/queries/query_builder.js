// return value divided by ','
// with sting or number format

const valuesDivideByComma = (data, setting) => {
  let string = "";
  let i = 0;

  for (const property in data) {
    if (i != 0) {
      string += ",";
    }
    if (setting[property] == "varchar") {
      string += "'" + data[property] + "'";
    } else {
      string += "'" + data[property] + "'";
    }
    i += 1;
  }

  return string;
};

// return column divided by comma
const columnDividedByComma = (data) => {
  return Object.keys(data).toString();
};

//retun 'column = value' divided by comma

const columnValueDividedByComma = (data, setting) => {
  let string = "";
  let i = 0;
  for (const property in data) {
    if (i != 0) {
      string += ",";
    }
    string += property + "=";
    if (setting[property] == "varchar") {
      string += "'" + data[property] + "'";
    } else {
      string += data[property];
    }
    i += 1;
  }
  return string;
};

module.exports = {
  valuesDivideByComma,
  columnDividedByComma,
  columnValueDividedByComma,
};
