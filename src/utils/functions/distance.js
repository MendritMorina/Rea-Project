//--------------Calculate distance between two points with latitude and longitude coordinates--------------------------

const distance = async () => {
  //function distance(latitude, longitude, latitude1, longitude1) {

  const R = 6371; // km (change this constant to get miles)
  var dLat = ((latitude1 - latitude) * Math.PI) / 180; // /180 because convert in radian (By default, coordinates (gotten using the Geolocation API) are given in degrees)
  var dLon = ((longitude1 - longitude) * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  if (d > 1) return Math.round(d) + 'km';
  else if (d <= 1) return Math.round(d * 1000) + 'm';
  return d;
};

// Exports of this file.
module.exports = distance;
