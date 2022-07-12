// Imports: local files.
const { httpCodes } = require('../configs');
const { asyncHandler } = require('../middlewares');

/**
 * @description Get Aqilinks.
 * @route       GET /api/links.
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

// Exports of this file.
module.exports = { getAqiLinks };
