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

    defaults: {
      from: null,
      to: null,
      interval: 'hour',
      subdivisionType: null
    },

    serializeToObject: function(orgUnitType, orgUnit)
    {
      var query = {
        subdivisionType: this.get('subdivisionType') || undefined,
        interval: this.get('interval'),
        from: this.get('from'),
        to: this.get('to')
      };

      if (!query.from || !query.to)
      {
        var firstShiftMoment = this.getFirstShiftMoment();

        query.from = firstShiftMoment.toISOString();
        query.to = firstShiftMoment.add('days', 1).toISOString();
      }

      if (orgUnitType && orgUnit)
      {
        query.orgUnitType = orgUnitType;
        query.orgUnit = orgUnit.id;
      }

      return query;
    },

    serializeToString: function()
    {
      var queryString = '';

      if (this.attributes.interval)
      {
        queryString += '&interval=' + this.attributes.interval;
      }

      if (this.attributes.subdivisionType)
      {
        queryString += '&subdivisionType=' + this.attributes.subdivisionType;
      }

      if (this.attributes.from && this.attributes.to)
      {
        queryString += '&from=' + encodeURIComponent(this.attributes.from);
        queryString += '&to=' + encodeURIComponent(this.attributes.to);
      }

      return queryString.substr(1);
    },

    getFirstShiftMoment: function()
    {
      var firstShiftMoment = time.getServerMoment();

      if (firstShiftMoment.hours() >= 0 && firstShiftMoment.hours() < 6)
      {
        firstShiftMoment.subtract('days', 1);
      }

      return firstShiftMoment.hours(6).minutes(0).seconds(0).milliseconds(0);
    }

  });
});
