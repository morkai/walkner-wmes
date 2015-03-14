// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model',
  '../orders/Order'
], function(
  Model,
  Order
) {
  'use strict';

  return Model.extend({

    urlRoot: '/xiconf/programOrders',

    clientUrlRoot: '#xiconf/programOrders',

    privilegePrefix: 'XICONF',

    nlsDomain: 'xiconfProgramOrders',

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
