// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../time',
  '../core/Model'
], function(
  t,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/divisions',

    clientUrlRoot: '#divisions',

    topicPrefix: 'divisions',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'divisions',

    labelAttribute: '_id',

    defaults: {
      type: 'prod'
    },

    serialize: function()
    {
      var o = this.toJSON();

      o.type = t('divisions', 'TYPE:' + o.type);
      o.deactivatedAt = o.deactivatedAt ? time.format(o.deactivatedAt, 'LL') : '';

      return o;
    },

    isActive: function(from)
    {
      var deactivatedAt = this.get('deactivatedAt');

      return !deactivatedAt || ((from || Date.now()) < Date.parse(deactivatedAt));
    }

  });
});
