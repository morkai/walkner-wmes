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

  var DEFAULT_DAYS_IN_MONTH = 20;
  var DEFAULT_SHIFTS_IN_DAY = 3;
  var DEFAULT_HOURS_IN_SHIFT = 7.5;
  var LINE_NAME_SEPARATORS = ['-', '_', '.'];

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

    serializeQuery: function()
    {
      var attrs = this.attributes;
      var query = [];

      query.push('days=' + _.map(attrs.daysInMonth, function(v, k) { return k + '=' + v; }));
      query.push('shifts=' + _.map(attrs.shiftsInDay, function(v, k) { return k + '=' + v; }));
      query.push('hours=' + (attrs.hoursInShift == null ? '' : attrs.hoursInShift));
      query.push('lines=' + _.map(attrs.customLines, function(v, k) { return k + '=' + v; }));

      return query.join('&');
    },

    parse: function(report)
    {
      report.groups[null] = {
        _id: null,
        name: '???',
        cags: [],
        color: '#FFFFFF'
      };

      var months = this.parseMonths(report);

      return {
        months: months,
        groups: this.parseGroups(report),
        cags: this.parseCags(report, months),
        lines: this.parseLines(report)
      };
    },

    parseMonths: function(report)
    {
      return _.map(report.months, function(monthTime)
      {
        var moment = time.getMoment(monthTime);

        return this.recountMonth({
          _id: monthTime,
          key: moment.format('YYMM'),
          label: moment.format('MMMM YYYY'),
          days: 0,
          customDays: null,
          shifts: 0,
          customShifts: null
        });
      }, this);
    },

    parseCags: function(report, months)
    {
      var attrs = this.attributes;
      var daysInMonth = attrs.daysInMonth.summary == null ? DEFAULT_DAYS_IN_MONTH : attrs.daysInMonth.summary;
      var shiftsInDay = attrs.shiftsInDay.summary == null ? DEFAULT_SHIFTS_IN_DAY : attrs.shiftsInDay.summary;

      return _.map(report.cags, function(cag)
      {
        cag.shortName = this.shortenCagName(cag.name);
        cag.group = report.groups[cag.group];

        return this.recountCag(cag, daysInMonth, shiftsInDay, months);
      }, this);
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
      return _.map(report.lines, function(cags, lineId)
      {
        return {
          _id: lineId,
          name: this.wrapLineName(lineId),
          cags: cags
        };
      }, this);
    },

    shortenCagName: function(fullName)
    {
      if (fullName.length > 28)
      {
        return fullName.substr(0, 13).trim() + '...' + fullName.substr(-10).trim();
      }

      return '';
    },

    wrapLineName: function(lineId)
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
    },

    recountMonth: function(month)
    {
      var attrs = this.attributes;
      var customDays = attrs.daysInMonth[month.key];
      var summaryDays = attrs.daysInMonth.summary;
      var customShifts = attrs.shiftsInDay[month.key];
      var summaryShifts = attrs.shiftsInDay.summary;

      month.days = summaryDays == null ? DEFAULT_DAYS_IN_MONTH : summaryDays;
      month.customDays = customDays == null ? null : customDays;
      month.shifts = summaryShifts == null ? DEFAULT_SHIFTS_IN_DAY : summaryShifts;
      month.customShifts = customShifts == null ? null : customShifts;

      return month;
    },

    recountCags: function()
    {
      var attrs = this.attributes;
      var daysInMonth = attrs.daysInMonth.summary == null ? DEFAULT_DAYS_IN_MONTH : attrs.daysInMonth.summary;
      var shiftsInDay = attrs.shiftsInDay.summary == null ? DEFAULT_SHIFTS_IN_DAY : attrs.shiftsInDay.summary;

      _.forEach(attrs.cags, function(cag) { this.recountCag(cag, daysInMonth, shiftsInDay, attrs.months); }, this);
    },

    recountCag: function(cag, daysInMonth, shiftsInDay, months)
    {
      var attrs = this.attributes;

      if (daysInMonth == null)
      {
        daysInMonth = attrs.daysInMonth.summary == null ? DEFAULT_DAYS_IN_MONTH : attrs.daysInMonth.summary;
      }

      if (shiftsInDay == null)
      {
        shiftsInDay = attrs.shiftsInDay.summary == null ? DEFAULT_SHIFTS_IN_DAY : attrs.shiftsInDay.summary;
      }

      if (!months)
      {
        months = attrs.months;
      }

      var cagCustomLines = attrs.customLines[cag._id];

      cag.customLines = cagCustomLines == null ? null : cagCustomLines;
      cag.customMonthLines = _.map(months, function(month)
      {
        var monthCustomLines = attrs.customLines[cag._id + month.key];

        return monthCustomLines == null ? null : monthCustomLines;
      });
      cag.maxOnLine = cag.avgQPerShift * daysInMonth * shiftsInDay;
      cag.maxOnLines = cag.maxOnLine * (cag.customLines === null ? cag.lines : cagCustomLines);
      cag.utilization = _.map(cag.plan, function(plan, i)
      {
        var month = months[i];
        var monthCustomLines = cag.customMonthLines[i];
        var monthLines = monthCustomLines !== null
          ? monthCustomLines
          : cag.customLines !== null
            ? cag.customLines
            : cag.lines;
        var monthDaysInMonth = month.customDays === null ? month.days : month.customDays;
        var monthShiftsInDay = month.customShifts === null ? month.shifts : month.customShifts;
        var maxOnLine = cag.avgQPerShift * monthDaysInMonth * monthShiftsInDay;
        var maxOnLines = maxOnLine * monthLines;
        var utilization = Math.round(plan / maxOnLines * 100);

        return isNaN(utilization) || !isFinite(utilization) ? 0 : utilization;
      });

      return cag;
    },

    setCustomLines: function(cagIndex, monthIndex, newValue)
    {
      var attrs = this.attributes;
      var cag = attrs.cags[cagIndex];

      if (!cag)
      {
        return;
      }

      var month = attrs.months[monthIndex];

      if (!month)
      {
        monthIndex = -1;
      }

      if (monthIndex !== -1)
      {
        if (newValue === cag.customMonthLines[monthIndex])
        {
          return;
        }

        if (newValue === null)
        {
          delete attrs.customLines[cag._id + month.key];
        }
        else
        {
          attrs.customLines[cag._id + month.key] = newValue;
        }
      }
      else
      {
        if (newValue === cag.customLines)
        {
          return;
        }

        if (newValue === null)
        {
          delete attrs.customLines[cag._id];
        }
        else
        {
          attrs.customLines[cag._id] = newValue;
        }
      }

      this.recountCag(cag);

      this.trigger('change:option', {
        option: 'customLines',
        cagIndex: cagIndex,
        monthIndex: monthIndex
      });
      this.trigger('change:customLines', {
        cagIndex: cagIndex,
        monthIndex: monthIndex,
        newValue: newValue
      });
      this.trigger('change');
    },

    setDaysInMonth: function(monthIndex, newValue)
    {
      this.setMonthsOption('daysInMonth', DEFAULT_DAYS_IN_MONTH, monthIndex, newValue);
    },

    setShiftsInDay: function(monthIndex, newValue)
    {
      this.setMonthsOption('shiftsInDay', DEFAULT_SHIFTS_IN_DAY, monthIndex, newValue);
    },

    setMonthsOption: function(option, defaultValue, monthIndex, newValue)
    {
      var attrs = this.attributes;
      var month = attrs.months[monthIndex];
      var customValues = attrs[option];
      var key = 'summary';

      if (!month)
      {
        monthIndex = -1;
      }
      else
      {
        key = month.key;
      }

      if (newValue === customValues[key])
      {
        return;
      }

      if (newValue === null)
      {
        delete customValues[key];
      }
      else
      {
        customValues[key] = newValue;
      }

      var displayValue = customValues.summary == null ? defaultValue : customValues.summary;

      if (monthIndex !== -1 && newValue !== null)
      {
        displayValue = newValue;
      }

      if (monthIndex === -1)
      {
        _.forEach(attrs.months, this.recountMonth, this);
      }
      else
      {
        this.recountMonth(attrs.months[monthIndex]);
      }

      this.recountCags();

      this.trigger('change:option', {
        option: option,
        cagIndex: -1,
        monthIndex: monthIndex
      });
      this.trigger('change:' + option, {
        option: option,
        monthIndex: monthIndex,
        newValue: newValue,
        displayValue: displayValue
      });
      this.trigger('change');
    },

    setHoursInShift: function(newValue)
    {
      var attrs = this.attributes;

      if (newValue === attrs.hoursInShift)
      {
        return;
      }

      attrs.hoursInShift = newValue;

      this.trigger('change:option', {
        option: 'hoursInShift',
        cagIndex: -1,
        monthIndex: -1
      });
      this.trigger('change:hoursInShift', {
        option: 'hoursInShift',
        monthIndex: -1,
        newValue: newValue,
        displayValue: newValue === null ? DEFAULT_HOURS_IN_SHIFT : newValue
      });
      this.trigger('change');
    }

  }, {

    DEFAULTS: {
      daysInMonth: DEFAULT_DAYS_IN_MONTH,
      shiftsInDay: DEFAULT_SHIFTS_IN_DAY,
      hoursInShift: DEFAULT_HOURS_IN_SHIFT
    },

    fromQuery: function(query)
    {
      var attrs = {};
      var queryStringToObject = function(queryString, obj)
      {
        if (!queryString)
        {
          return;
        }

        queryString.split(',').forEach(function(item)
        {
          var parts = item.split('=');

          obj[parts[0]] = parseInt(parts[1], 10);
        });
      };

      if (query.days)
      {
        queryStringToObject(query.days, attrs.daysInMonth = {});
      }

      if (query.shifts)
      {
        queryStringToObject(query.shifts, attrs.shiftsInDay = {});
      }

      var hoursInShift = parseFloat(query.hours);

      if (!isNaN(hoursInShift))
      {
        attrs.hoursInShift = hoursInShift;
      }

      if (query.lines)
      {
        queryStringToObject(query.lines, attrs.customLines = {});
      }

      return new this(attrs);
    }

  });
});
