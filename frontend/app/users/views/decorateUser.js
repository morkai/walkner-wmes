define([
  'app/i18n',
  'app/data/aors',
  'app/data/companies',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/views/renderOrgUnitPath',
  'i18n!app/nls/users'
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

    if (user.aor)
    {
      var aor = aors.get(user.aor);

      if (aor)
      {
        user.aor = aor.getLabel();
      }
    }

    if (!user.aor)
    {
      user.aor = t('users', 'NO_DATA:aor');
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
