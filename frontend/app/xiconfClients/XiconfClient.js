// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../i18n',
  '../core/Model',
  '../xiconf/util/serializeXiconfLicenseFeatures',
  '../licenses/util/compareVersions'
], function(
  _,
  time,
  t,
  Model,
  serializeXiconfLicenseFeatures,
  compareVersions
) {
  'use strict';

  return Model.extend({

    urlRoot: '/xiconf/clients',

    clientUrlRoot: '#xiconf/clients',

    privilegePrefix: 'XICONF',

    nlsDomain: 'xiconfClients',

    serialize: function(options)
    {
      var obj = this.toJSON();

      obj.className = !obj.connectedAt ? 'danger' : obj.inputMode === 'remote' ? 'success' : 'warning';
      obj.lastSeenAt = time.format(obj.connectedAt || obj.disconnectedAt, 'L, LTS');
      obj.orderLink = obj.order ? ('<a href="#xiconf/orders/' + obj.order + '">' + obj.order + '</a>') : '-';

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
      var licenseHref = '#licenses/' + obj.license;
      var licenseTag = obj.connectedAt ? 'a' : 'span';

      if (obj.licenseError)
      {
        licenseClass += ' licenses-invalid';
        licenseTitle += '\r\n' + t('licenses', 'error:' + obj.licenseError);
      }

      obj.shortLicense = '<' + licenseTag + ' class="' + licenseClass + '" title="' + licenseTitle
        + '" href="' + licenseHref + '">'
        + obj.license.substr(0, 4) + '...' + obj.license.substr(-4)
        + '</' + licenseTag + '>';

      obj.appVersionCmp = compareVersions(obj.appVersion, options.appVersion);

      if (options && options.appVersion && obj.appVersion && obj.appVersionCmp === -1)
      {
        obj.appVersion = '<span class="licenses-version licenses-invalid" title="&lt; ' + options.appVersion + '">'
          + obj.appVersion
          + '</span>';
      }

      obj.coreScannerDriver = '<i class="fa ' + (obj.coreScannerDriver ? 'fa-thumbs-o-up' : 'fa-thumbs-down')
        + '" title="' + t('xiconfClients', 'coreScannerDriver:' + !!obj.coreScannerDriver) + '"></i>';

      return obj;
    }

  });

});
