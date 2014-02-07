define([
  'underscore',
  'app/time'
], function(
  _,
  time
) {
  'use strict';

  var datetimeSupported = document.createElement('input');
  datetimeSupported.setAttribute('type', 'datetime-local');
  datetimeSupported = datetimeSupported.type !== 'text';

  var TYPE_TO_FORMAT = {
    'datetime-local': 'YYYY-MM-DD HH:mm',
    'date': 'YYYY-MM-DD',
    'time': 'HH:mm'
  };

  function fixEl($el, defaultTime)
  {
    /*jshint -W015*/

    var elMoment;

    if ($el.hasClass('form-group-datetime'))
    {
      var $elDate = $el.find('input[type=date]');
      var $elTime = $el.find('input[type=time]');
      var elDate = $elDate.val().trim();
      var elTime = $elTime.val().trim();

      if (elTime.length === 0)
      {
        elTime = defaultTime;
      }

      elMoment = time.getMoment(elDate + ' ' + elTime);
    }
    else
    {
      elMoment = time.getMoment($el.val());
    }

    var valid = elMoment.isValid();

    if ($el.hasClass('form-group-datetime'))
    {
      $el.find('input[type=date]').val(valid ? elMoment.format('YYYY-MM-DD') : '');
      $el.find('input[type=time]').val(valid ? elMoment.format('HH:mm') : defaultTime);
    }
    else if (!valid)
    {
      $el.val('');
    }
    else
    {
      var val = '';

      switch ($el.attr('type'))
      {
        case 'datetime-local':
        case 'datetime':
          val = elMoment.toISOString();
          break;

        case 'date':
          val = elMoment.format('YYYY-MM-DD');
          break;

        case 'time':
          val = elMoment.format('HH:mm');
          break;

        default:
          val = elMoment.format('YYYY-MM-DD HH:mm');
          break;
      }

      $el.val(val);
    }

    return elMoment;
  }

  var fixTimeRange = {};

  fixTimeRange.fromView = function(view, options)
  {
    options = _.defaults(options || {}, {
      fromId: 'from',
      toId: 'to',
      defaultTime: '00:00'
    });

    var timeRange = {
      from: null,
      to: null
    };

    var fromMoment = fixEl(view.$id(options.fromId), options.defaultTime);
    var toMoment = fixEl(view.$id(options.toId), options.defaultTime);

    if (fromMoment.isValid())
    {
      timeRange.from = fromMoment.valueOf();
    }

    if (toMoment.isValid())
    {
      timeRange.to = toMoment.valueOf();
    }

    return timeRange;
  };

  fixTimeRange.toFormData = function(formData, rqlQueryTerm, type)
  {
    if (rqlQueryTerm.name === 'select' || rqlQueryTerm.name === 'sort')
    {
      return;
    }

    var property = rqlQueryTerm.name === 'ge' ? 'from': 'to';
    var moment = time.getMoment(rqlQueryTerm.args[1]);

    if (type === 'date+time')
    {
      formData[property + '-date'] = moment.format('YYYY-MM-DD');
      formData[property + '-time'] = moment.format('HH:mm');
    }
    else if (type === 'datetime')
    {
      formData[property] = datetimeSupported
        ? moment.toISOString()
        : moment.format('YYYY-MM-DD HH:mm:ss');
    }
    else if (type === 'time')
    {
      formData[property] = moment.format('HH:mm:ss');
    }
    else
    {
      formData[property] = moment.format('YYYY-MM-DD');
    }
  };

  return fixTimeRange;
});
