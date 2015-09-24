// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model',
  '../data/companies',
  '../data/colorFactory'
], function(
  Model,
  companies,
  colorFactory
) {
  'use strict';

  return Model.extend({

    urlRoot: '/opinionSurveys/employers',

    clientUrlRoot: '#opinionSurveyEmployers',

    topicPrefix: 'opinionSurveys.employers',

    privilegePrefix: 'OPINION_SURVEYS',

    nlsDomain: 'opinionSurveyEmployers',

    labelAttribute: 'short',

    getColor: function()
    {
      var company = companies.get(this.id);
      var color = null;

      if (company)
      {
        color = company.get('color');
      }

      return color || colorFactory.getColor('opinionSurveys:employers', this.id);
    }

  });
});
