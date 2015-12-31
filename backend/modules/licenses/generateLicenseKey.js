// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var moment = require('moment');
var semver = require('semver');
var uuid = require('node-uuid');

module.exports = function generateLicenseKey(privateKey, options)
{
  if (!_.isObject(privateKey) || !_.isFunction(privateKey.privateEncrypt))
  {
    throw new Error("A valid `privateKey` object is required!");
  }

  if (!_.isObject(options))
  {
    options = {};
  }

  var appId = options.appId;

  if (!_.isString(appId) || _.isEmpty(appId))
  {
    throw new Error("The `appId` option is required!");
  }

  var licensee = options.licensee;

  if (!_.isString(licensee) || _.isEmpty(licensee))
  {
    throw new Error("The `licensee` option is required!");
  }

  var appVersion = options.appVersion;

  if (appVersion == null)
  {
    appVersion = '*';
  }
  else if (!_.isString(appVersion) || _.isEmpty(appVersion) || !semver.validRange(appVersion))
  {
    throw new Error("The `appVersion` option must be a semver compatible version!");
  }

  var date = options.date;

  if (date == null)
  {
    date = moment().format('YYMMDD');
  }
  else if (_.isNumber(date) || (_.isDate(date) && !isNaN(date.getTime())))
  {
    date = moment(date).format('YYMMDD');
  }
  else if (!_.isString(date) || _.isEmpty(date) || !moment(date, 'YYMMDD').isValid())
  {
    throw new Error("The `date` option must be a Date, a UNIX timestamp or a date string in the YYMMDD format!");
  }

  var id = options._id || options.id;

  if (id == null)
  {
    id = uuid.v4().toUpperCase();
  }
  else if (!_.isString(id) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
  {
    throw new Error("The `id` option must be a valid UUID v4!");
  }

  var features = Math.round(options.features);

  if (features == null)
  {
    features = 0;
  }
  else if (!_.isNumber(features) || isNaN(features) || features < 0)
  {
    throw new Error("The `features` option must be a number greater than or equal to 0!");
  }

  var data = [
    appId,
    appVersion,
    date,
    id,
    licensee,
    features
  ].join('\n');

  var licenseKey = privateKey.privateEncrypt(new Buffer(data, 'utf8')).toString('base64');
  var pem = ['-----BEGIN LICENSE KEY-----'];

  for (var i = 0; i < licenseKey.length; i += 65)
  {
    pem.push(licenseKey.substr(i, 65));
  }

  pem.push('-----END LICENSE KEY-----');

  return pem.join('\n');
};
