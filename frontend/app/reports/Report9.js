// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../time',
  '../core/Model',
  '../core/util/colorLabel'
], function(
  _,
  time,
  Model,
  colorLabel
) {
  'use strict';

  function shortenCagName(fullName)
  {
    if (fullName.length > 28)
    {
      return fullName.substr(0, 13).trim() + '...' + fullName.substr(-10).trim();
    }

    return '';
  }

  var LINE_NAME_SEPARATORS = ['-', '_', '.'];

  function prepareLineName(lineId)
  {
    var name = lineId + '\n\n';

    if (lineId.length <= 4)
    {
      return name;
    }

    for (var i = 0; i < LINE_NAME_SEPARATORS.length; ++i)
    {
      var separator = LINE_NAME_SEPARATORS[i];
      var parts = lineId.split(separator);

      if (parts.length === 2)
      {
        return parts.join('\n' + separator);
      }

      if (parts.length > 2)
      {
        name = parts.pop();

        if (name.length === 1)
        {
          name = parts.pop() + separator + name;
        }

        return parts.join(separator) + '\n' + separator + name;
      }
    }

    return name;
  }

  var DEFAULT_DAYS_IN_MONTH = 20;
  var DEFAULT_SHIFTS_IN_DAY = 3;
  var DEFAULT_HOURS_IN_SHIFT = 7.5;

  return Model.extend({

    urlRoot: '/reports/9',

    defaults: function()
    {
      return {
        daysInMonth: {},
        shiftsInDay: {},
        hoursInShift: null,
        customLines: {},
        months: [],
        groups: [],
        cags: [],
        lines: []
      };
    },

    parse: function(report)
    {
      report.groups[null] = {
        _id: null,
        name: '???',
        cags: [],
        color: '#FFFFFF'
      };

      var attrs = {
        months: this.parseMonths(report),
        groups: this.parseGroups(report),
        cags: this.parseCags(report),
        lines: this.parseLines(report)
      };

      return attrs;
    },

    parseMonths: function(report)
    {
      var attrs = this.attributes;

      return _.map(report.months, function(monthTime)
      {
        var moment = time.getMoment(monthTime);
        var key = moment.format('YYMM');

        return {
          _id: monthTime,
          key: moment.format('YYMM'),
          label: moment.format('MMMM YYYY'),
          days: attrs.daysInMonth[key] || attrs.daysInMonth.summary || DEFAULT_DAYS_IN_MONTH,
          shifts: attrs.shiftsInDay[key] || attrs.shiftsInDay.summary || DEFAULT_SHIFTS_IN_DAY
        };
      });
    },

    parseCags: function(report)
    {
      var attrs = this.attributes;
      var daysInMonth = attrs.daysInMonth.summary || DEFAULT_DAYS_IN_MONTH;
      var shiftsInDay = attrs.shiftsInDay.summary || DEFAULT_SHIFTS_IN_DAY;

      return _.map(report.cags, function(cag)
      {
        var customLines = attrs.customLines[cag._id];

        cag.shortName = shortenCagName(cag.name);
        cag.group = report.groups[cag.group];
        cag.customLines = customLines || null;
        cag.maxOnLine = cag.avgQPerShift * daysInMonth * shiftsInDay;
        cag.maxOnLines = cag.maxOnLine * (customLines || cag.lines);
        cag.utilization = _.map(cag.plan, function(plan)
        {
          var utilization = Math.round(plan / cag.maxOnLines * 100);

          return isNaN(utilization) || !isFinite(utilization) ? 0 : utilization;
        });

        return cag;
      });
    },

    parseGroups: function(report)
    {
      return _.map(report.groups, function(group)
      {
        if (!group.color)
        {
          group.color = '#FFFFFF';
        }

        group.contrast = colorLabel.requiresContrast(group.color);

        return group;
      });
    },

    parseLines: function(report)
    {
      var lines = [];

      _.forEach(report.lines, function(cags, lineId)
      {
        lines.push({
          _id: lineId,
          name: prepareLineName(lineId),
          cags: cags
        });
      });

      return lines;
    }

  });
});
