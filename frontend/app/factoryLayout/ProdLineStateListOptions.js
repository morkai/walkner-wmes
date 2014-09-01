// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../core/Model',
  '../data/orgUnits'
], function(
  _,
  Model
) {
  'use strict';

  return Model.extend({

    defaults: {
      division: null,
      prodLines: null
    },

    serializeToString: function()
    {
      var queryString = '';
      var attrs = this.attributes;

      if (attrs.division)
      {
        queryString += '&division=' + encodeURIComponent(attrs.division);
      }

      if (Array.isArray(attrs.prodLines) && attrs.prodLines.length)
      {
        queryString += '&prodLines=' + attrs.prodLines.map(encodeURIComponent);
      }

      return queryString.substr(1);
    },

    hasDivision: function()
    {
      return this.get('division') !== null;
    }

  }, {

    fromQuery: function(query)
    {
      return new this({
        division: query.division || null,
        prodLines: query.prodLines ? query.prodLines.split(',') : null
      });
    }

  });
});
