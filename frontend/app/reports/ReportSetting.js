// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../settings/Setting'
], function(
  Setting
) {
  'use strict';

  return Setting.extend({

    urlRoot: '/reports/settings',

    getType: function()
    {
      if (/color$/.test(this.id))
      {
        return 'color';
      }

      if (/coeff$/.test(this.id))
      {
        return 'coeff';
      }

      return 'ref';
    },

    getMetricName: function()
    {
      var matches = this.id.match(/^reports\.(.*?)\./);

      return matches ? matches[1] : null;
    },

    getOrgUnit: function()
    {
      var matches = this.id.match(/^reports\..*?\.(.*?)$/);

      return matches ? matches[1] : null;
    }

  });
});
