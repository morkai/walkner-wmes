// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/colorFactory'
], function(
  colorFactory
) {
  'use strict';

  function createLabel(key)
  {
    var color = colorFactory.getColor('LICENSES', key);

    return '<span class="label license-feature" style="background: ' + color + '">' + key + '</span>';
  }

  return function createLicenseFeaturesSerializer(supportedFeatures)
  {
    var FEATURE_BITS = [];
    var FEATURE_COLORS = {};

    for (var i = 0; i < supportedFeatures.length; ++i)
    {
      var bit = Math.pow(2, i);

      FEATURE_BITS.push(bit);
      FEATURE_COLORS[bit] = createLabel(supportedFeatures[i]);
    }

    return function serializeLicenseFeatures(licenseFeatures)
    {
      var features = [];

      for (var i = 0; i < FEATURE_BITS.length; ++i)
      {
        var featureBit = FEATURE_BITS[i];

        if (licenseFeatures & featureBit)
        {
          features.push(FEATURE_COLORS[featureBit]);
        }
      }

      return features.join(' ');
    };
  };


});
