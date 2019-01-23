// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/util/getShiftStartInfo',
  'app/core/templates/forms/dateTimeRange'
], function(
  _,
  $,
  t,
  time,
  getShiftStartInfo,
  template
) {
  'use strict';

  var DATE_FORMATS = {
    date: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    'date+time': 'YYYY-MM-DD',
    time: 'HH:mm:ss'
  };
  var RANGE_GROUPS = {
    shifts: ['+0+1', '-1+0', '1', '2', '3'],
    days: ['+0+1', '-1+0', '-7+0', '-14+0', '-28+0'],
    weeks: ['+0+1', '-1+0', '-2+0', '-3+0', '-4+0'],
    months: ['+0+1', '-1+0', '-2+0', '-3+0', '-6+0'],
    quarters: ['+0+1', '1', '2', '3', '4', null],
    years: ['+0+1', '-1+0', null, null, null]
  };

  var eventsBound = false;

  function bindEvents()
  {
    if (eventsBound)
    {
      return;
    }

    $(document).on('click', '.dateTimeRange-is-input > .dropdown-toggle', toggleInput);

    eventsBound = true;
  }

  function toggleInput(e)
  {
    var labelEl = e.currentTarget;
    var inputEl = document.getElementById(labelEl.htmlFor);

    if (!inputEl)
    {
      return;
    }

    requestAnimationFrame(function()
    {
      if (!inputEl.disabled)
      {
        $(inputEl).prop('checked', true).trigger('change');
      }
    });
  }

  function prepareDropdown(label)
  {
    if (!Array.isArray(label.dropdown))
    {
      return null;
    }

    return label.dropdown.map(function(item)
    {
      if (typeof item.attrs === 'object')
      {
        item.attrs = Object.keys(item.attrs).map(function(k) { return k + '="' + item.attrs[k] + '"'; }).join(' ');
      }

      return item;
    });
  }

  function prepareRanges(label)
  {
    if (label.ranges === true)
    {
      label.ranges = '';
    }

    if (typeof label.ranges !== 'string')
    {
      return null;
    }

    var ranges = {
      shifts: false,
      days: true,
      weeks: true,
      months: true,
      quarters: true,
      years: true
    };

    var parts = label.ranges.split(' ');

    if (parts.some(function(part) { return /^[^+\-]/.test(part); }))
    {
      Object.keys(ranges).forEach(function(k) { ranges[k] = false; });
    }

    var rangeGroups = _.assign({}, RANGE_GROUPS);

    label.ranges.split(' ').forEach(function(group)
    {
      var op = group.charAt(0) === '-' ? '-' : '+';
      var parts = group.replace(/^[^a-z]+/, '').split(':');
      var groupName = parts.shift();
      var customRanges = parts.length ? parts[0].split('_') : [];

      ranges[groupName] = op === '+';

      if (customRanges.length)
      {
        rangeGroups[groupName] = customRanges;
      }
    });

    Object.keys(ranges).forEach(function(group)
    {
      if (!rangeGroups[group] || !ranges[group])
      {
        delete ranges[group];
        return;
      }

      ranges[group] = rangeGroups[group];
    });

    return ranges;
  }

  function resolveInterval(timeRange, group)
  {
    var h = 3600 * 1000;
    var h3 = 3 * h;

    if (timeRange <= 8 * h)
    {
      return 'hour';
    }

    var d = 24 * h;

    if (timeRange <= d + h)
    {
      return 'shift';
    }

    if (group === 'weeks' && timeRange > 14 * d - h3 && timeRange <= 28 * d + h3)
    {
      return 'week';
    }

    var m = 31 * d;

    if (timeRange <= m + h3)
    {
      return 'day';
    }

    if (timeRange < 2.5 * m)
    {
      return 'week';
    }

    if (timeRange > 12 * m)
    {
      return 'year';
    }

    return 'month';
  }

  function render(options)
  {
    bindEvents();

    var type = options.type || 'date';
    var templateData = {
      idPrefix: options.idPrefix || 'v',
      property: options.property || 'date',
      formGroup: options.formGroup !== false,
      hidden: options.hidden === true,
      utc: options.utc ? 1 : 0,
      setTime: options.setTime !== false ? 1 : 0,
      type: type,
      startHour: options.startHour || 0,
      shiftLength: options.shiftLength || 8,
      minDate: options.minDate || window.PRODUCTION_DATA_START_DATE || '',
      maxDate: options.maxDate === ''
        ? ''
        : (options.maxDate || time.getMoment().add(1, 'years').format(DATE_FORMATS[type])),
      labels: [],
      separator: options.separator || '–',
      required: {
        date: false,
        time: false
      }
    };

    if (options.required)
    {
      var req = templateData.required;

      if (typeof options.required === 'boolean')
      {
        req.date = true;
        req.time = true;
      }
      else
      {
        req.date = !!options.required.date;
        req.time = !!options.required.time;
      }
    }

    if (!options.labels)
    {
      templateData.labels.push({ranges: true});
    }
    else if (!Array.isArray(options.labels))
    {
      templateData.labels.push(options.labels);
    }
    else
    {
      templateData.labels = [].concat(options.labels);
    }

    templateData.labels = templateData.labels.map(function(label)
    {
      return {
        text: label.text || t('core', 'dateTimeRange:label:' + templateData.type),
        dropdown: prepareDropdown(label),
        input: label.input || null,
        ranges: prepareRanges(label)
      };
    });

    return template(templateData);
  }

  render.handleRangeEvent = function(e)
  {
    var view = this;
    var $target = view.$(e.target).closest('a[data-date-time-range]');
    var $container = $target.closest('.dateTimeRange');
    var type = $container[0].dataset.type;
    var utc = $container[0].dataset.utc === '1';
    var startHour = +$container[0].dataset.startHour;
    var shiftLength = +$container[0].dataset.shiftLength;
    var group = $target[0].dataset.dateTimeGroup;
    var range = $target[0].dataset.dateTimeRange;
    var actualGroup = group;
    var rangeMultiplier = 1;
    var shiftInfo = getShiftStartInfo(Date.now(), {
      utc: utc,
      startHour: startHour,
      shiftLength: shiftLength
    });
    var fromMoment = shiftInfo.moment;
    var toMoment = null;

    if (fromMoment.hours() < startHour)
    {
      fromMoment.subtract(24, 'hours');
    }

    if (group === 'shifts')
    {
      actualGroup = 'hours';
      rangeMultiplier = shiftLength;
    }
    else
    {
      fromMoment.startOf('day');
    }

    if (/^[0-9]+$/.test(range))
    {
      if (group === 'shifts')
      {
        fromMoment
          .subtract((shiftInfo.no - 1) * shiftInfo.length, 'hours')
          .add((+range - 1) * shiftInfo.length, 'hours');
        toMoment = fromMoment.clone().add(shiftInfo.length, 'hours');
      }
      else
      {
        if (range === '0')
        {
          fromMoment.startOf(actualGroup);
        }
        else
        {
          fromMoment.startOf('year').add(range - 1, actualGroup);
        }

        toMoment = fromMoment.clone().add(1, actualGroup);
      }
    }
    else
    {
      var matches = range.match(/^([+-])([0-9]+)([+-])([0-9]+)$/) || [0, '+', '0', '+', '1'];

      toMoment = fromMoment.startOf(actualGroup).clone()[matches[3] === '+' ? 'add' : 'subtract'](
        +matches[4] * rangeMultiplier, actualGroup
      );
      fromMoment = fromMoment[matches[1] === '+' ? 'add' : 'subtract'](
        +matches[2] * rangeMultiplier, actualGroup
      );
    }
    if (group !== 'shifts')
    {
      fromMoment.hours(startHour);
      toMoment.hours(startHour);
    }

    var dateFormat = DATE_FORMATS[type];

    $container.find('input[name="from-date"]').val(fromMoment.format(dateFormat));
    $container.find('input[name="from-time"]').val(fromMoment.format('HH:mm:ss'));
    $container.find('input[name="to-date"]').val(toMoment.format(dateFormat));
    $container.find('input[name="to-time"]').val(toMoment.format('HH:mm:ss'));

    var $intervals = view.$('[name="interval"]');

    if ($intervals.length)
    {
      var intervalMap = {};
      var intervalList = [];

      $intervals.each(function()
      {
        if (this.disabled || this.parentNode.classList.contains('disabled'))
        {
          return;
        }

        intervalMap[this.value] = this;
        intervalList.push(this.value);
      });

      var interval = resolveInterval(toMoment.valueOf() - fromMoment.valueOf(), group);

      if (!intervalMap[interval])
      {
        interval = intervalList[intervalList.length - 1];
      }

      if (interval)
      {
        $intervals.filter('[value="' + interval + '"]').parent().click();
      }
    }

    if (e.altKey)
    {
      view.$('[type="submit"]').click();
    }
  };

  render.serialize = function(view)
  {
    var $container = view.$('.dateTimeRange');
    var type = $container[0].dataset.type;
    var dateFormat = DATE_FORMATS[type];
    var utc = $container[0].dataset.utc === '1';
    var setTime = $container[0].dataset.setTime === '1';
    var startHour = $container[0].dataset.startHour;
    var $fromDate = $container.find('input[name="from-date"]');
    var $fromTime = $container.find('input[name="from-time"]');
    var $toDate = $container.find('input[name="to-date"]');
    var $toTime = $container.find('input[name="to-time"]');
    var fromDate = $fromDate.val();
    var fromTime = $fromTime.val();
    var toDate = $toDate.val();
    var toTime = $toTime.val();

    if (!$fromDate.length || fromDate.length < 7)
    {
      fromDate = '1970-01-01';
    }

    if (!$toDate.length || toDate.length < 7)
    {
      toDate = '1970-01-01';
    }

    if (fromDate.length === 7)
    {
      fromDate += '-01';
    }

    if (toDate.length === 7)
    {
      toDate += '-01';
    }

    var startTime = setTime
      ? ((startHour.length === 1 ? '0' : '') + startHour + ':00')
      : '00:00:00';

    if (!$fromTime.length || fromTime.length < 5)
    {
      fromTime = startTime;
    }

    if (!$toTime.length || toTime.length < 5)
    {
      toTime = startTime;
    }

    if (fromTime.length === 5)
    {
      fromTime += ':00';
    }

    if (toTime.length === 5)
    {
      toTime += ':00';
    }

    var fromMoment = (utc ? time.utc : time).getMoment(fromDate + ' ' + fromTime, 'YYYY-MM-DD HH:mm:ss');
    var toMoment = (utc ? time.utc : time).getMoment(toDate + ' ' + toTime, 'YYYY-MM-DD HH:mm:ss');

    if (isInvalid(fromMoment, $fromDate))
    {
      $fromDate.val('');
      $fromTime.val('');

      fromMoment = null;
    }
    else
    {
      $fromDate.val(fromMoment.format(dateFormat));
      $fromTime.val(fromMoment.format('HH:mm:ss'));
    }

    if (isInvalid(toMoment, $toDate))
    {
      $toDate.val('');
      $toTime.val('');

      toMoment = null;
    }
    else
    {
      $toDate.val(toMoment.format(dateFormat));
      $toTime.val(toMoment.format('HH:mm:ss'));
    }

    return {
      property: $container[0].dataset.property,
      from: fromMoment,
      to: toMoment
    };

    function isInvalid(moment)
    {
      if (!moment.isValid())
      {
        return true;
      }

      if (type === 'time')
      {
        return false;
      }

      return moment.year() === 1970;
    }
  };

  render.formToRql = function(view, rqlSelector)
  {
    var dateTimeRange = render.serialize(view);

    if (dateTimeRange.from)
    {
      rqlSelector.push({
        name: 'ge',
        args: [dateTimeRange.property, dateTimeRange.from.valueOf()]
      });
    }

    if (dateTimeRange.to)
    {
      rqlSelector.push({
        name: 'lt',
        args: [dateTimeRange.property, dateTimeRange.to.valueOf()]
      });
    }
  };

  render.rqlToForm = function(propertyName, term, formData)
  {
    var view = this;
    var dataset = view.$('.dateTimeRange')[0].dataset;
    var dateFormat = DATE_FORMATS[dataset.type];
    var utc = dataset.utc === '1';
    var moment = (utc ? time.utc : time).getMoment(term.args[1]);
    var dir;

    if (term.name === 'ge' || term.name === 'gt')
    {
      dir = 'from';
    }
    else if (term.name === 'le' || term.name === 'lt')
    {
      dir = 'to';
    }

    if (!dir || !moment.isValid())
    {
      return;
    }

    formData[dir + '-date'] = moment.format(dateFormat);
    formData[dir + '-time'] = moment.format('HH:mm:ss');
  };

  return render;
});
