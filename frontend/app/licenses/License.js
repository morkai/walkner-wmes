// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../time',
  '../core/Model',
  '../xiconf/util/serializeXiconfLicenseFeatures',
  '../icpo/util/serializeIcpoLicenseFeatures'
], function(
  t,
  time,
  Model,
  serializeXiconfLicenseFeatures,
  serializeIcpoLicenseFeatures
) {
  'use strict';

  var FEATURE_SERIALIZERS = {
    'walkner-xiconf': serializeXiconfLicenseFeatures,
    'walkner-icpo': serializeIcpoLicenseFeatures
  };

  return Model.extend({

    urlRoot: '/licenses',

    clientUrlRoot: '#licenses',

    topicPrefix: 'licenses',

    privilegePrefix: 'LICENSES',

    nlsDomain: 'licenses',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.appName = t('licenses', 'app:' + obj.appId);
      obj.date = time.format(obj.date, 'L');
      obj.expireDate = obj.expireDate ? time.format(obj.expireDate, 'L') : '-';
      obj.features = this.serializeFeatures();

      return obj;
    },

    serializeFeatures: function()
    {
      var featureSerializer = FEATURE_SERIALIZERS[this.get('appId')];
      var features = this.get('features');

      if (featureSerializer)
      {
        return featureSerializer(features);
      }

      return features ? features.toString() : '-';
    }

  });
});
