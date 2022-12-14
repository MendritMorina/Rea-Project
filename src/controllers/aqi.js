// Imports: local files.
const aqiCalculator = require('../utils/functions/aqi/aqi-calculator');
const { PredictionAQI } = require('../models');
const { httpCodes } = require('../configs');
const { asyncHandler } = require('../middlewares');

/**
 * @description Get aqi links.
 * @route       GET /api/aqi/links.
 * @access      Public.
 */
const getAqiLinks = asyncHandler(async (request, response) => {
  const todayDate = new Date();
  todayDate.setMinutes(0);
  todayDate.setSeconds(0);
  todayDate.setMilliseconds(0);
  const today = todayDate.toISOString();

  const tomorrowDate = new Date(today);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString();

  const aftertomorrowDate = new Date(today);
  aftertomorrowDate.setDate(aftertomorrowDate.getDate() + 2);
  const afterTomorrow = aftertomorrowDate.toISOString();

  const prishtinaBaseLink = `https://airqualitykosova.rks-gov.net/cgeoserver/kosovo/wms?format=image/png&layers=kosovo:regionstat_view_municipalities&transparent=true&version=1.1.1&tiled=true&srs=EPSG:3857&exceptions=application/vnd.ogc.se_xml&styles=&feature_count=101&service=WMS&request=GetFeatureInfo&bbox=2348145.5089206137,5165920.119625352,2504688.542848654,5322463.153553393&width=256&height=256&query_layers=regionstat_view_municipalities&x=21&y=82&info_format=application/json`;

  const pejaBaseLink = `https://airqualitykosova.rks-gov.net/cgeoserver/kosovo/wms?format=image/png&layers=kosovo:regionstat_view_municipalities&transparent=true&version=1.1.1&tiled=true&srs=EPSG:3857&exceptions=application/vnd.ogc.se_xml&styles=&feature_count=101&service=WMS&request=GetFeatureInfo&bbox=2191602.4749925733,5165920.119625352,2348145.5089206137,5322463.153553393&width=256&height=256&query_layers=regionstat_view_municipalities&x=113&y=93&info_format=application/json`;

  const prizreniBaseLink = `https://airqualitykosova.rks-gov.net/cgeoserver/kosovo/wms?format=image%2Fpng&layers=kosovo%3Aregionstat_view_municipalities&transparent=true&version=1.1.1&tiled=true&srs=EPSG%3A3857&exceptions=application%2Fvnd.ogc.se_xml&styles=&feature_count=101&service=WMS&request=GetFeatureInfo&bbox=2191602.4749925733%2C5165920.119625352%2C2348145.5089206137%2C5322463.153553393&width=256&height=256&query_layers=regionstat_view_municipalities&x=183&y=207&info_format=application/json`;

  const gjakovaBaseLink = `https://airqualitykosova.rks-gov.net/cgeoserver/kosovo/wms?format=image/png&layers=kosovo:regionstat_view_municipalities&transparent=true&version=1.1.1&tiled=true&srs=EPSG:3857&exceptions=application/vnd.ogc.se_xml&styles=&feature_count=101&service=WMS&request=GetFeatureInfo&bbox=2191602.4749925733,5165920.119625352,2348145.5089206137,5322463.153553393&width=256&height=256&query_layers=regionstat_view_municipalities&x=132&y=166&info_format=application/json`;

  const mitrovicaBaseLink = `https://airqualitykosova.rks-gov.net/cgeoserver/kosovo/wms?format=image/png&layers=kosovo:regionstat_view_municipalities&transparent=true&version=1.1.1&tiled=true&srs=EPSG:3857&exceptions=application/vnd.ogc.se_xml&styles=&feature_count=101&service=WMS&request=GetFeatureInfo&bbox=2191602.4749925733,5165920.119625352,2348145.5089206137,5322463.153553393&width=256&height=256&query_layers=regionstat_view_municipalities&x=227&y=29&info_format=application/json`;

  const links = {
    prishtina: {
      todayLink: `${prishtinaBaseLink}&time=${today}`,
      tomorrowLink: `${prishtinaBaseLink}&time=${tomorrow}`,
      dayAfterTomorrowLink: `${prishtinaBaseLink}&time=${afterTomorrow}`,
    },
    peja: {
      todayLink: `${pejaBaseLink}&time=${today}`,
      tomorrowLink: `${pejaBaseLink}&time=${tomorrow}`,
      dayAfterTomorrowLink: `${pejaBaseLink}&time=${afterTomorrow}`,
    },
    prizreni: {
      todayLink: `${prizreniBaseLink}&time=${today}`,
      tomorrowLink: `${prizreniBaseLink}&time=${tomorrow}`,
      dayAfterTomorrowLink: `${prizreniBaseLink}&time=${afterTomorrow}`,
    },
    gjakova: {
      todayLink: `${gjakovaBaseLink}&time=${today}`,
      tomorrowLink: `${gjakovaBaseLink}&time=${tomorrow}`,
      dayAfterTomorrowLink: `${gjakovaBaseLink}&time=${afterTomorrow}`,
    },
    mitrovica: {
      todayLink: `${mitrovicaBaseLink}&time=${today}`,
      tomorrowLink: `${mitrovicaBaseLink}&time=${tomorrow}`,
      dayAfterTomorrowLink: `${mitrovicaBaseLink}&time=${afterTomorrow}`,
    },
  };

  response.status(httpCodes.OK).json({ success: true, data: { links }, error: null });
  return;
});

/**
 * @description Get predictions.
 * @route       GET /api/aqi/predictions.
 * @access      Private.
 */
const getPredictions = asyncHandler(async (request, response, next) => {
  const { longitude, latitude } = request.query;

  const nearestAQIPoint = await PredictionAQI.findOne({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: 20000,
      },
    },
  });
  if (!nearestAQIPoint) {
    response.status(httpCodes.OK).json({ success: true, data: { furtherThan20km: true }, error: null });
    return;
  }

  const otherAQIs = await PredictionAQI.find({
    longitude: nearestAQIPoint.longitude,
    latitude: nearestAQIPoint.latitude,
  })
    .sort('-_id')
    .limit(1);
  const currentAQINearest = otherAQIs && otherAQIs.length ? otherAQIs[0] : null;
  if (!currentAQINearest) {
    next(new ApiError('Couldnt find nearest point!', httpCodes.NOT_FOUND));
    return;
  }

  const { localtime: datetime, pm25, pm10, so2, no2, o3 } = currentAQINearest;
  const aqiData = [{ datetime, pm25, pm10, so2, no2, o3 }];
  const aqiValue = aqiCalculator(aqiData);
  const airQuality = airQualityFromAQI(aqiValue);

  const message = `Cil??sia e ajrit gjat?? dit??s ??sht??: ${airQuality}!`;
  response.status(httpCodes.OK).json({ success: true, data: { message, value: aqiValue }, error: null });
  return;
});

// Exports of this file.
module.exports = { getAqiLinks, getPredictions };

// Helpers for this controller.
function airQualityFromAQI(aqi) {
  let airQuality = '';

  if (aqi < 51) {
    airQuality = 'E mir??';
  } else if (aqi >= 51 && aqi < 100) {
    airQuality = 'E pranueshme';
  } else if (aqi >= 101 && aqi < 150) {
    airQuality = 'Mesatare';
  } else if (aqi >= 151 && aqi < 200) {
    airQuality = 'E dob??t';
  } else if (aqi >= 200 && aqi < 300) {
    airQuality = 'Shume e dob??t';
  } else {
    airQuality = 'Jasht??zakonisht e dob??t';
  }

  return airQuality;
}
