// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  '../data/orgUnits',
  '../mrpControllers/MrpController',
  './ReportClip'
], function(
  _,
  time,
  Model,
  orgUnits,
  MrpController,
  ReportClip
) {
  'use strict';

  return Model.extend({

    defaults: function()
    {
      var today = time.getMoment();

      if (today.hours() < 6)
      {
        today.subtract(1, 'days');
      }

      today.startOf('day');

      return {
        orgUnitType: null,
        orgUnitId: null,
        to: today.valueOf(),
        from: today.subtract(7, 'days').valueOf(),
        interval: 'day',
        limit: 25,
        skip: 0,
        orderHash: null,
        orderCount: 0
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

      if (!parentOrgUnit && parentOrgUnitType === 'mrpController')
      {
        parentOrgUnit = new MrpController({
          _id: this.get('orgUnitId'),
          subdivision: null // TODO?
        });
      }

      if (!parentReport)
      {
        parentReport = new ReportClip(
          {orgUnitType: this.get('orgUnitType'), orgUnit: parentOrgUnit},
          options
        );
      }

      reports.push(parentReport);

      var childOrgUnitType = orgUnits.getChildType(parentOrgUnitType);
      var childOrgUnits;

      if (parentOrgUnit)
      {
        if (childOrgUnitType === 'mrpController')
        {
          childOrgUnits = parentReport.get('children').map(function(mrp)
          {
            var mrpController = orgUnits.getByTypeAndId('mrpController', mrp);

            return new MrpController({
              _id: mrp,
              subdivision: parentOrgUnit.id,
              description: mrpController ? mrpController.get('description') : ''
            });
          });
        }
        else if (childOrgUnitType === 'prodFlow')
        {
          childOrgUnits = parentReport.get('children').map(function(orgUnitId)
          {
            return orgUnits.getByTypeAndId(childOrgUnitType, orgUnitId);
          });
        }
        else
        {
          childOrgUnits = orgUnits.getChildren(parentOrgUnit);

          if (childOrgUnitType === 'subdivision')
          {
            childOrgUnits = childOrgUnits.filter(function(subdivision)
            {
              return subdivision.get('type') === 'assembly';
            });
          }
        }
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
        if (childReport && childOrgUnit.id === childReport.get('orgUnit').id)
        {
          reports.push(childReport);
        }
        else
        {
          reports.push(new ReportClip(
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
        to: this.get('to')
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

      queryString += '&limit=' + attrs.limit;
      queryString += '&skip=' + attrs.skip;

      return queryString.substr(1);
    }

  });
});
