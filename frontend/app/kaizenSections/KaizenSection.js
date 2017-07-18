// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model',
  '../data/orgUnits'
], function(
  _,
  Model,
  orgUnits
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/sections',

    clientUrlRoot: '#kaizenSections',

    topicPrefix: 'kaizen.sections',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenSections',

    labelAttribute: 'name',

    defaults: {},

    serialize: function()
    {
      var o = this.toJSON();

      o.subdivisions = _.map(o.subdivisions, function(s)
      {
        s = orgUnits.getByTypeAndId('subdivision', s);

        return s
          ? (s.get('division') + ' \\ ' + s.get('name'))
          : '';
      }).filter(function(s) { return !!s.length; }).join('; ');

      return o;
    }

  });
});
