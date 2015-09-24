// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../time',
  '../core/Model'
], function(
  _,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    serializeToObject: function()
    {
      var attrs = this.attributes;
      var obj = {};

      ['surveys', 'divisions', 'superiors', 'employers'].forEach(function(prop)
      {
        obj[prop] = attrs[prop].join(',');
      });

      return obj;
    },

    serializeToString: function()
    {
      var queryString = '';
      var attrs = this.attributes;

      ['surveys', 'divisions', 'superiors', 'employers'].forEach(function(prop)
      {
        queryString += '&' + prop + '=' + attrs[prop].join(',');
      });

      return queryString.substr(1);
    }

  }, {

    fromQuery: function(query)
    {
      var OpinionSurveyReportQuery = this;
      var attrs = {};

      ['surveys', 'divisions', 'superiors', 'employers'].forEach(function(prop)
      {
        var value = query[prop];

        attrs[prop] = _.isEmpty(value) ? [] : value.split(',');
      });

      return new OpinionSurveyReportQuery(attrs);
    }

  });
});
