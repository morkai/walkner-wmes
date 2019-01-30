// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  '../data/orgUnits',
  './Report5'
], function(
  _,
  time,
  Model,
  orgUnits,
  Report5
) {
  'use strict';

  return Model.extend({

    defaults: function()
    {
      var today = time.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0);

      return {
        orgUnitType: null,
        orgUnitId: null,
        to: today.valueOf(),
        from: today.subtract(1, 'days').valueOf(),
        interval: 'shift',
        weekends: true
      };
    },

    reset: function(query)
    {
      this.set(_.defaults(query, this.defaults()), {reset: true});
    },

    createReports: function(parentReport, childReport, options)
    {
      var reports = [];
      var parentOrgUnitType = this.get('orgUnitType');
      var parentOrgUnit = orgUnits.getByTypeAndId(parentOrgUnitType, this.get('orgUnitId'));

      if (!parentReport)
      {
        parentReport = new Report5(
          {orgUnitType: this.get('orgUnitType'), orgUnit: parentOrgUnit},
          options
        );
      }

      reports.push(parentReport);

      var childOrgUnitType = orgUnits.getChildType(parentOrgUnitType);
      var childOrgUnits;

      if (parentOrgUnit)
      {
        childOrgUnits = orgUnits.getChildren(parentOrgUnit).sort(function(a, b)
        {
          return a.getLabel().localeCompare(b.getLabel(), undefined, {numeric: true, ignorePunctuation: true});
        });
      }
      else
      {
        childOrgUnits = orgUnits
          .getAllDivisions()
          .filter(function(division) { return division.get('type') !== 'other'; })
          .sort(function(a, b)
          {
            var aType = a.get('type');

            if (aType === b.get('type'))
            {
              return a.id.localeCompare(b.id, undefined, {numeric: true, ignorePunctuation: true});
            }

            return aType === 'prod' ? -1 : 1;
          });
      }

      childOrgUnits.forEach(function(childOrgUnit)
      {
        if (childReport && childOrgUnit === childReport.get('orgUnit'))
        {
          reports.push(childReport);
        }
        else
        {
          reports.push(new Report5(
            {orgUnitType: childOrgUnitType, orgUnit: childOrgUnit},
            options
          ));
        }
      });

      return reports;
    },

    serializeToObject: function(orgUnitType, orgUnit)
    {
      var query = {
        interval: this.get('interval'),
        from: this.get('from'),
        to: this.get('to'),
        weekends: this.get('weekends')
      };

      if (orgUnitType && orgUnit)
      {
        query.orgUnitType = orgUnitType;
        query.orgUnitId = orgUnit.id;
      }

      return query;
    },

    serializeToString: function(orgUnitType, orgUnitId)
    {
      var queryString = '';
      var attrs = this.attributes;

      if (attrs.interval)
      {
        queryString += '&interval=' + attrs.interval;
      }

      if (attrs.weekends)
      {
        queryString += '&weekends=1';
      }

      if (attrs.from && attrs.to)
      {
        queryString += '&from=' + attrs.from;
        queryString += '&to=' + attrs.to;
      }

      if (arguments.length === 2 && orgUnitType !== undefined)
      {
        if (orgUnitType)
        {
          queryString += '&orgUnitType=' + orgUnitType;
          queryString += '&orgUnitId=' + encodeURIComponent(orgUnitId);
        }
      }
      else if (attrs.orgUnitType)
      {
        queryString += '&orgUnitType=' + attrs.orgUnitType;
        queryString += '&orgUnitId=' + encodeURIComponent(attrs.orgUnitId);
      }

      return queryString.substr(1);
    }

  });
});
