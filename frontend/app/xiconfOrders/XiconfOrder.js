// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/xiconf/orders',

    clientUrlRoot: '#xiconf/orders',

    privilegePrefix: 'XICONF',

    nlsDomain: 'xiconfOrders',

    getStatusClassName: function()
    {
      switch (this.get('status'))
      {
        case -1:
          return 'danger';

        case 1:
          return 'warning';

        default:
          return 'success';
      }
    }

  });

});
