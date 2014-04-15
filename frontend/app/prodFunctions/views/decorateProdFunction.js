// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
