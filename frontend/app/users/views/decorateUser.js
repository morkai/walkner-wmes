define([
  'app/i18n',
  'app/data/aors',
  'app/data/companies',
  'i18n!app/nls/users'
], function(
  t,
  aors,
  companies
) {
  'use strict';

  return function(user)
  {
    var company = companies.get(user.company);

    if (company)
    {
      user.company = company.getLabel();
    }

    if (user.aor)
    {
      var aor = aors.get(user.aor);

      if (aor)
      {
        user.aor = aor.getLabel();
      }
    }
    else
    {
      user.aor = t('users', 'LIST:NO_DATA:aor');
    }

    if (user.prodFunction)
    {
      user.prodFunction = t('users', 'PROD_FUNCTION:' + user.prodFunction);
    }

    return user;
  };
});
