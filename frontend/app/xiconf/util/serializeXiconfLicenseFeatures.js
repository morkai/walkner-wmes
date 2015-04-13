// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/data/colorFactory'
], function(
  colorFactory
) {
  'use strict';

  var COLOR_GROUP = 'XICONF_LICENSE';
  var FEATURE_BITS = [1, 2, 4, 8];
  var FEATURE_COLORS = {
    1: label('wmes'),
    2: label('sol'),
    4: label('t24vdc'),
    8: label('led')
  };

  function label(key)
  {
    var color = colorFactory.getColor(COLOR_GROUP, key);

    return '<span class="label license-feature" style="background: ' + color + '">' + key + '</span>';
  }

  return function serializeXiconfLicenseFeatures(supportedFeatures)
  {
    var features = [];

    for (var i = 0; i < FEATURE_BITS.length; ++i)
    {
      var featureBit = FEATURE_BITS[i];

      if (supportedFeatures & featureBit)
      {
        features.push(FEATURE_COLORS[featureBit]);
      }
    }

    return features.join(' ');
  };
});
