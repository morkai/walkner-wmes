// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  './tags'
], function(
  Model,
  tags
) {
  'use strict';

  return Model.extend({

    urlRoot: '/printing/printers',

    clientUrlRoot: '#printers',

    topicPrefix: 'printing.printers',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'printers',

    labelAttribute: 'label',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.tags = tags.toString(obj.tags);

      return obj;
    }

  });
});
