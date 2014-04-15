// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/time',
  'app/i18n',
  'app/data/subdivisions',
  'app/data/mrpControllers',
  'app/data/prodFlows',
  'app/data/prodLines',
  'app/data/views/renderOrgUnitPath',
  'app/core/templates/userInfo'
], function(
  time,
  t,
  subdivisions,
  mrpControllers,
  prodFlows,
  prodLines,
  renderOrgUnitPath,
  renderUserInfo
) {
  'use strict';

  return function(prodShiftModel, options)
  {
    /*jshint -W015*/

    var prodShift = prodShiftModel.toJSON();

    prodShift.createdAt = time.format(prodShift.createdAt, 'YYYY-MM-DD HH:mm:ss');
    prodShift.creator = renderUserInfo({userInfo: prodShift.creator});

    prodShift.date = time.format(prodShift.date, 'YYYY-MM-DD');
    prodShift.shift = t('core', 'SHIFT:' + prodShift.shift);

    if (options.orgUnits)
    {
      var subdivision = subdivisions.get(prodShift.subdivision);
      var prodFlow = prodFlows.get(prodShift.prodFlow);

      prodShift.subdivision = subdivision ? subdivision.getLabel() : '?';
      prodShift.prodFlow = prodFlow ? prodFlow.getLabel() : '?';
      prodShift.mrpControllers =
        Array.isArray(prodShift.mrpControllers) && prodShift.mrpControllers.length
          ? prodShift.mrpControllers.join('; ')
          : '?';
    }

    if (options.personnel)
    {
      prodShift.master = renderUserInfo({userInfo: prodShift.master});
      prodShift.leader = renderUserInfo({userInfo: prodShift.leader});
      prodShift.operator = renderUserInfo({userInfo: prodShift.operator});
    }

    return prodShift;
  };
});
