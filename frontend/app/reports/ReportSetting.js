// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../settings/Setting'
], function(
  Setting
) {
  'use strict';

  return Setting.extend({

    urlRoot: '/reports/settings',

    nlsDomain: 'reports',

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

      if (/(id|prodTask)$/.test(this.id))
      {
        return 'id';
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
