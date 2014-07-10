// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../i18n',
  '../data/companies',
  '../core/Model'
], function(
  t,
  companies,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodFunctions',

    clientUrlRoot: '#prodFunctions',

    topicPrefix: 'prodFunctions',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'prodFunctions',

    labelAttribute: 'label',

    defaults: function()
    {
      return {
        label: '',
        fteMasterPosition: -1,
        direct: false,
        dirIndirRatio: 100,
        companies: []
      };
    },

    toJSON: function()
    {
      var prodFunction = Model.prototype.toJSON.call(this);

      if (!prodFunction.label)
      {
        prodFunction.label = prodFunction._id;
      }

      return prodFunction;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.dirIndirRatio = obj.direct
        ? (obj.dirIndirRatio.toLocaleString() + ' / ' + (100 - obj.dirIndirRatio).toLocaleString())
        : '-';

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
    }

  });
});
