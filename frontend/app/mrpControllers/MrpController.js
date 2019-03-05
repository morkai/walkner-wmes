// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  '../i18n',
  '../time',
  '../core/Model',
  'app/data/subdivisions'
], function(
  require,
  t,
  time,
  Model,
  subdivisions
) {
  'use strict';

  return Model.extend({

    urlRoot: '/mrpControllers',

    clientUrlRoot: '#mrpControllers',

    topicPrefix: 'mrpControllers',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'mrpControllers',

    labelAttribute: '_id',

    defaults: {
      subdivision: null,
      description: null,
      deactivatedAt: null,
      replacedBy: null,
      inout: 0
    },

    getSubdivision: function()
    {
      return subdivisions.get(this.get('subdivision')) || null;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.subdivision = require('app/orgUnits/util/renderOrgUnitPath')(this, true);
      obj.deactivatedAt = obj.deactivatedAt ? time.format(obj.deactivatedAt, 'LL') : '';
      obj.inout = t('mrpControllers', 'inout:' + obj.inout);

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.className = this.get('deactivatedAt') ? 'is-deactivated' : '';

      return obj;
    }

  });
});
