// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/events/types',

    clientUrlRoot: '#events/types',

    nlsDomain: 'events',

    labelAttribute: 'text',

    defaults: {},

    toSelect2Option: function()
    {
      return {
        id: this.id,
        text: this.getLabel()
      };
    }

  });
});
