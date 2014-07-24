// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/data/aors',
  'app/data/companies',
  'app/data/prodFunctions',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/views/renderOrgUnitPath'
], function(
  t,
  aors,
  companies,
  prodFunctions,
  divisions,
  subdivisions,
  renderOrgUnitPath
) {
  'use strict';

  return function(user)
  {
    /*jshint -W015*/

    var obj = user.toJSON();
    var company = companies.get(obj.company);

    obj.company = company ? company.getLabel() : t('users', 'NO_DATA:company');

    if (Array.isArray(obj.aors))
    {
      obj.aors = obj.aors
        .map(function(aorId)
        {
          var aor = aors.get(aorId);

          return aor ? aor.getLabel() : null;
        })
        .filter(function(aorLabel)
        {
          return !!aorLabel;
        })
        .join('; ');
    }
    else
    {
      obj.aors = '';
    }

    if (!obj.aors.length)
    {
      obj.aors = t('users', 'NO_DATA:aors');
    }

    var prodFunction = prodFunctions.get(obj.prodFunction);

    obj.prodFunction = prodFunction ? prodFunction.getLabel() : t('users', 'NO_DATA:prodFunction');

    if (obj.orgUnitType && obj.orgUnitId)
    {
      var orgUnitModel;

      switch (obj.orgUnitType)
      {
        case 'division':
          orgUnitModel = divisions.get(obj.orgUnitId);
          break;

        case 'subdivision':
          orgUnitModel = subdivisions.get(obj.orgUnitId);
          break;
      }

      if (orgUnitModel)
      {
        obj.orgUnit = renderOrgUnitPath(orgUnitModel, false, false);
      }
    }

    if (obj.vendor)
    {
      if (obj.vendor.name)
      {
        obj.vendor = obj.vendor.name + ' (' + obj.vendor._id + ')';
      }
      else if (obj.vendor._id)
      {
        obj.vendor = obj.vendor._id;
      }
    }

    return obj;
  };
});
