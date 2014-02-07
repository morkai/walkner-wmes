define([
  'app/i18n',
  'app/data/aors',
  'app/data/companies',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/views/renderOrgUnitPath'
], function(
  t,
  aors,
  companies,
  divisions,
  subdivisions,
  renderOrgUnitPath
) {
  'use strict';

  return function(user)
  {
    /*jshint -W015*/

    var company = companies.get(user.company);

    user.company = company ? company.getLabel() : t('users', 'NO_DATA:company');

    if (Array.isArray(user.aors))
    {
      user.aors = user.aors
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
      user.aors = '';
    }

    if (!user.aors.length)
    {
      user.aors = t('users', 'NO_DATA:aors');
    }

    if (user.prodFunction)
    {
      user.prodFunction = t('users', 'PROD_FUNCTION:' + user.prodFunction);
    }

    if (user.orgUnitType && user.orgUnitId)
    {
      var orgUnitModel;

      switch (user.orgUnitType)
      {
        case 'division':
          orgUnitModel = divisions.get(user.orgUnitId);
          break;

        case 'subdivision':
          orgUnitModel = subdivisions.get(user.orgUnitId);
          break;
      }

      if (orgUnitModel)
      {
        user.orgUnit = renderOrgUnitPath(orgUnitModel, false, false);
      }
    }

    return user;
  };
});
