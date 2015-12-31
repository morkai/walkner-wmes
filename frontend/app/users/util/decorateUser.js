// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    obj.company = company ? company.getLabel() : '-';

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
        });
    }
    else
    {
      obj.aors = [];
    }

    var prodFunction = prodFunctions.get(obj.prodFunction);

    obj.prodFunction = prodFunction ? prodFunction.getLabel() : '-';

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
