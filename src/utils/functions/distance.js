//--------------Calculate distance between two points with latitude and longitude coordinates--------------------------

const distance = async () => {
  //function distance(latitude, longitude, latitude1, longitude1) {
  const { longitude, latitude } = request.user;

  const nearestAQIPoints = await AQI.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude1, latitude1],
        },
      },
    },
  }).sort({ createdAt: -1 });
  const nearestAQIPoint = nearestAQIPoints[0];
  if (!nearestAQIPoint) {
    next(new ApiError('Failed to find nearest point!', httpCodes.NOT_FOUND));
    return;
  }

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

//---------- calculate the distance between two locations -------------------------------

// Convert from degrees to radians
//   function degreesToRadians(degrees) {
//     var radians = (degrees * Math.PI) / 180;
//     return radians;
//   }

//   function calcDistance(startingCoords, destinationCoords) {
//     let startingLat = degreesToRadians(startCoords.latitude);
//     let startingLong = degreesToRadians(startCoords.longitude);
//     let destinationLat = degreesToRadians(destCoords.latitude);
//     let destinationLong = degreesToRadians(destCoords.longitude);

//     // Radius of the Earth in kilometers
//     let radius = 6571;

//     // Haversine equation
//     let distanceInKilometers =
//       Math.acos(
//         Math.sin(startingLat) * Math.sin(destinationLat) +
//           Math.cos(startingLat) * Math.cos(destinationLat) * Math.cos(startingLong - destinationLong)
//       ) * radius;
//     return distanceInKilometers;
//   }

//----------------------------------------------------------------------
