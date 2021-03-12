// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model'
], function(
  require,
  t,
  time,
  currentUser,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/employments',

    clientUrlRoot: '#osh/employments',

    topicPrefix: 'osh.employments',

    privilegePrefix: 'OSH:HR',

    nlsDomain: 'wmes-osh-employments',

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
      obj.locked = t('core', `BOOL:${obj.locked}`);

      return obj;
    },

    serializeRow: function()
    {
      const obj = this.serialize();

      obj.internal = 0;
      obj.external = 0;
      obj.absent = 0;
      obj.total = 0;
      obj.observers = 0;

      obj.departments.forEach(d =>
      {
        if (!d.department)
        {
          return;
        }

        obj.internal += d.internal;
        obj.external += d.external;
        obj.absent += d.absent;
        obj.total += d.total;
        obj.observers += d.observers;
      });

      return obj;
    },

    serializeDetails: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.serialize();

      obj.orgUnits = obj.departments.map(d =>
      {
        return {
          division: d.division ? dictionaries.getLabel('divisions', d.division) : '',
          workplace: d.workplace ? dictionaries.getLabel('workplaces', d.workplace) : '',
          department: d.department ? dictionaries.getLabel('departments', d.department) : '',
          internal: d.internal,
          external: d.external,
          absent: d.absent,
          total: d.total,
          observers: d.observers
        };
      });

      return obj;
    }

  }, {

    canDelete: function()
    {
      return currentUser.isAllowedTo('SUPER');
    }

  });
});
