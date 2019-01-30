// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  '../data/orgUnits',
  './Report1'
], function(
  _,
  time,
  Model,
  orgUnits,
  Report1
) {
  'use strict';

  return Model.extend({

    defaults: {
      orgUnitType: null,
      orgUnitId: null,
      from: null,
      to: null,
      interval: 'hour',
      ignoredOrgUnits: null
    },

    reset: function(query)
    {
      this.set(this.constructor.fromQuery(query).attributes, {reset: true});
    },

    createReports: function(parentReport, childReport, options)
    {
      var reports = [];
      var parentOrgUnitType = this.get('orgUnitType');
      var parentOrgUnit = orgUnits.getByTypeAndId(parentOrgUnitType, this.get('orgUnitId'));

      if (!parentReport)
      {
        parentReport = new Report1({orgUnitType: this.get('orgUnitType'), orgUnit: parentOrgUnit}, options);
      }

      reports.push(parentReport);

      var childOrgUnitType = orgUnits.getChildType(parentOrgUnitType);
      var childOrgUnits;

      if (parentOrgUnit)
      {
        childOrgUnits = orgUnits.getChildren(parentOrgUnit);
      }
      else
      {
        childOrgUnits = orgUnits.getAllDivisions().filter(function(division)
        {
          return division.get('type') === 'prod';
        });
      }

      childOrgUnits.sort(function(a, b)
      {
        return a.getLabel().localeCompare(b.getLabel(), undefined, {numeric: true, ignorePunctuation: true});
      });

      childOrgUnits.forEach(function(childOrgUnit)
      {
        if (childReport && childOrgUnit === childReport.get('orgUnit'))
        {
          reports.push(childReport);
        }
        else
        {
          reports.push(new Report1({orgUnitType: childOrgUnitType, orgUnit: childOrgUnit}, options));
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
        orgUnitType: undefined,
        orgUnitId: undefined,
        ignoredOrgUnits: this.serializeIgnoredOrgUnits()
      };

      if (!query.from || !query.to)
      {
        var firstShiftMoment = this.getFirstShiftMoment();

        query.from = firstShiftMoment.toISOString();
        query.to = firstShiftMoment.add(1, 'days').toISOString();
      }

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

      if (attrs.from && attrs.to)
      {
        queryString += '&from=' + encodeURIComponent(attrs.from);
        queryString += '&to=' + encodeURIComponent(attrs.to);
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

      if (!_.isEmpty(attrs.ignoredOrgUnits))
      {
        queryString += '&ignoredOrgUnits=' + encodeURIComponent(this.serializeIgnoredOrgUnits());
      }

      return queryString.substr(1);
    },

    serializeIgnoredOrgUnits: function()
    {
      return btoa(JSON.stringify(this.attributes.ignoredOrgUnits));
    },

    getFirstShiftMoment: function()
    {
      var firstShiftMoment = time.getMoment();

      if (firstShiftMoment.hours() >= 0 && firstShiftMoment.hours() < 6)
      {
        firstShiftMoment.subtract(1, 'days');
      }

      return firstShiftMoment.hours(6).minutes(0).seconds(0).milliseconds(0);
    },

    isAutoMode: function()
    {
      return !this.get('from') && !this.get('to');
    },

    toString: function()
    {
      return this.serializeToString();
    }

  }, {

    fromQuery: function(query)
    {
      if (query && query.ignoredOrgUnits)
      {
        query.ignoredOrgUnits = JSON.parse(atob(query.ignoredOrgUnits));
      }

      return new this(query);
    }

  });
});
