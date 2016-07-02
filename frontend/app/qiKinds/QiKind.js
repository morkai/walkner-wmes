// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model',
  '../data/orgUnits'
], function(
  t,
  Model,
  orgUnits
) {
  'use strict';

  return Model.extend({

    urlRoot: '/qi/kinds',

    clientUrlRoot: '#qi/kinds',

    topicPrefix: 'qi.kinds',

    privilegePrefix: 'QI:DICTIONARIES',

    nlsDomain: 'qiKinds',

    labelAttribute: 'name',

    serialize: function()
    {
      var obj = this.toJSON();
      var division = orgUnits.getByTypeAndId('division', obj.division);

      obj.division = obj.division
        ? (division ? division.getLabel() : obj.division)
        : t.bound('qiKinds', 'ordersDivision');

      return obj;
    }

  });
});
