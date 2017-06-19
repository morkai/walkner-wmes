// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
