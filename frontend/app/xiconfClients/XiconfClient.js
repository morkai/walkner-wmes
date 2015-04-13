// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../core/Model'
], function(
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/xiconf/clients',

    clientUrlRoot: '#xiconf/clients',

    privilegePrefix: 'XICONF',

    nlsDomain: 'xiconfClients',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.className = obj.connectedAt ? 'success' : 'danger';
      obj.lastSeenAt = time.format(obj.connectedAt || obj.disconnectedAt, 'LLLL');

      if (obj.order)
      {
        obj.orderLink = '<a href="#xiconf/orders/' + obj.order + '">' + obj.order + '</a>';
      }

      if (!obj.license || /^0000+.+0000$/.test(obj.license))
      {
        obj.shortLicense = null;
      }
      else
      {
        obj.shortLicense = '<span title="' + obj.license + '">'
          + obj.license.substr(0, 4) + '...' + obj.license.substr(-4)
          + '</span>';
      }

      return obj;
    }

  });

});
