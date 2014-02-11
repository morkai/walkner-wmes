define([
  'app/i18n',
  'app/data/companies'
],
function(
  t,
  companies
) {
  'use strict';

  return function decorateProdFunction(model)
  {
    var obj = model.toJSON();

    obj.direct = t('prodFunctions', 'direct:' + obj.direct);

    obj.companies = (obj.companies || [])
      .map(function(companyId)
      {
        var company = companies.get(companyId);

        return company ? company.getLabel() : null;
      })
      .filter(function(label) { return !!label; })
      .join('; ');

    if (!obj.companies.length)
    {
      obj.companies = '-';
    }

    return obj;
  };
});
