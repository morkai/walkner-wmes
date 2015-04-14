// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../time',
  '../i18n',
  '../core/Model',
  '../xiconf/util/serializeXiconfLicenseFeatures'
], function(
  _,
  time,
  t,
  Model,
  serializeXiconfLicenseFeatures
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

      if (_.isObject(obj.license))
      {
        obj.features = serializeXiconfLicenseFeatures(obj.license.features);
        obj.license = obj.license._id;
      }
      else
      {
        obj.features = null;
      }

      if (!obj.license)
      {
        obj.license = '00000000-0000-0000-0000-000000000000';
      }

      if (!obj.licenseError && /^0000.+0000$/.test(obj.license))
      {
        obj.licenseError = 'NO_KEY';
      }

      var licenseClass = 'licenses-id';
      var licenseTitle = obj.license;

      if (obj.licenseError)
      {
        licenseClass += ' licenses-invalid';
        licenseTitle += '\r\n' + t('licenses', 'error:' + obj.licenseError);
      }

      obj.shortLicense = '<span class="' + licenseClass + '" title="' + licenseTitle + '">'
        + obj.license.substr(0, 4) + '...' + obj.license.substr(-4)
        + '</span>';

      return obj;
    }

  });

});
