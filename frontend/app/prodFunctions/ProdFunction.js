// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../i18n',
  '../data/companies',
  '../core/Model',
  'app/core/templates/colorLabel'
], function(
  t,
  companies,
  Model,
  colorLabelTemplate
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
        fteLeaderPosition: -1,
        fteOtherPosition: -1,
        direct: false,
        dirIndirRatio: 100,
        companies: [],
        color: '#000000'
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      if (!obj.label)
      {
        obj.label = obj._id;
      }

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

      obj.color = colorLabelTemplate({color: obj.color});

      if (obj.fteMasterPosition === -1)
      {
        obj.fteMasterPosition = '-';
      }

      if (obj.fteLeaderPosition === -1)
      {
        obj.fteLeaderPosition = '-';
      }

      if (obj.fteOtherPosition === -1)
      {
        obj.fteOtherPosition = '-';
      }

      return obj;
    }

  });
});
