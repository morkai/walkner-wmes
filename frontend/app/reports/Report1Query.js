// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      subdivisionType: null
    },

    reset: function(query)
    {
      this.set(_.defaults(query, this.defaults), {reset: true});
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
        return a.getLabel().localeCompare(b.getLabel());
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

      if (attrs.subdivisionType)
      {
        queryString += '&subdivisionType=' + attrs.subdivisionType;
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

      return queryString.substr(1);
    },

    getFirstShiftMoment: function()
    {
      var firstShiftMoment = time.getMoment();

      if (firstShiftMoment.hours() >= 0 && firstShiftMoment.hours() < 6)
      {
        firstShiftMoment.subtract('days', 1);
      }

      return firstShiftMoment.hours(6).minutes(0).seconds(0).milliseconds(0);
    },

    isAutoMode: function()
    {
      return !this.get('from') && !this.get('to');
    }

  });
});
