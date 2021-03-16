// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/util/sortByProps'
], function(
  require,
  time,
  currentUser,
  Model,
  sortByProps
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/targets',

    clientUrlRoot: '#osh/targets',

    topicPrefix: 'osh.targets',

    privilegePrefix: 'OSH:HR',

    nlsDomain: 'wmes-osh-targets',

    getLabel: function()
    {
      return time.utc.format(this.id, 'MMMM YYYY');
    },

    parse: function(res)
    {
      res._id = time.utc.format(res._id, 'YYYY-MM-DD');

      return res;
    },

    serialize: function()
    {
      const obj = this.toJSON();

      obj.month = time.utc.format(obj._id, 'MMMM YYYY');

      return obj;
    },

    serializeRow: function()
    {
      const obj = this.serialize();

      return obj;
    },

    serializeDetails: function()
    {
      const obj = this.serialize();

      obj.orgUnits = this.serializeOrgUnits().sort(
        sortByProps(['divisionLabel', 'workplaceLabel', 'departmentLabel'])
      );

      return obj;
    },

    serializeOrgUnits: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');

      return (this.get('orgUnits') || []).map(d =>
      {
        return {
          type: d.department ? 'department' : d.workplace ? 'workplace' : d.division ? 'division' : 'overall',
          key: `d${d.division}w${d.workplace}d${d.department}`,
          division: d.division,
          divisionLabel: dictionaries.getLabel('divisions', d.division),
          workplace: d.workplace,
          workplaceLabel: dictionaries.getLabel('workplaces', d.workplace),
          department: d.department,
          departmentLabel: dictionaries.getLabel('departments', d.department),
          targets: d.targets
        };
      });
    }

  }, {

    canDelete: function()
    {
      return currentUser.isAllowedTo('SUPER');
    }

  });
});
