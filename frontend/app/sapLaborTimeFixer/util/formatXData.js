// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore'
], function(
  _
) {
  'use strict';

  var MAX_LINE_LENGTH = 72;
  var DEPS_NULL = '__NULL__';

  return function(workCenter, requiredDeps, options)
  {
    options = _.assign({html: true}, options);

    var sb = [];
    var laborTimes = workCenter.laborTimes;

    if (requiredDeps.length)
    {
      laborTimes = laborTimes.filter(function(laborTime)
      {
        var actualDeps = laborTime.deps === null ? DEPS_NULL : laborTime.deps;

        return requiredDeps.indexOf(actualDeps) !== -1;
      });
    }

    var lastI = laborTimes.length - 1;

    laborTimes.forEach(function(laborTime, i)
    {
      formatLaborTime(laborTime, i === 0, i === lastI);
    });

    return sb.join('');

    function formatLaborTime(laborTime, isFirst, isLast)
    {
      if (!isFirst)
      {
        sb.push('\n');
      }

      if (options.html)
      {
        sb.push('<span class="hljs-comment">');
      }

      sb.push('* ' + laborTime.row);

      if (laborTime.item)
      {
        sb.push(' | ' + laborTime.item);
      }

      if (laborTime.nc12)
      {
        sb.push(' | ' + laborTime.nc12);
      }

      if (laborTime.deps)
      {
        sb.push(' | ' + laborTime.deps);
      }

      var description = laborTime.description;

      if (description)
      {
        if (description.length > MAX_LINE_LENGTH - 7)
        {
          description = description.substring(0, MAX_LINE_LENGTH - 12) + '...';
        }

        sb.push('\n* ' + description);
      }

      if (options.html)
      {
        sb.push('</span>');
      }

      sb.push('\n$SELF.LABOR_TIME = $SELF.LABOR_TIME + ');

      if (options.html)
      {
        sb.push('<span class="hljs-number">');
      }

      sb.push(Math.round(laborTime.value * 1000) / 1000);

      if (options.html)
      {
        sb.push('</span>');
      }

      var keys = Object.keys(laborTime.conditions);
      var lastI = keys.length - 1;

      keys.forEach(function(key, i)
      {
        formatCondition(key, laborTime.conditions[key], i === 0, i === lastI);
      });

      if (!isLast)
      {
        sb.push(',');
      }
    }

    function formatCondition(key, values, isFirst, isLast)
    {
      if (values.length === 0)
      {
        return;
      }

      sb.push('\n');

      if (!Array.isArray(values))
      {
        sb.push(formatKey(key, isFirst, false, options.html));
        sb.push(formatOperator(values));

        if (isLast)
        {
          sb.push(')');
        }

        return;
      }

      var formattedLine = formatKey(key, isFirst, true, options.html);
      var unformattedLine = formatKey(key, isFirst, true, false);
      var lastI = values.length - 1;

      values.forEach(function(value, i)
      {
        var suffix = i === lastI ? ')' : ', ';

        if (unformattedLine.length + value.length + suffix.length > MAX_LINE_LENGTH)
        {
          sb.push(formattedLine + '\n');

          formattedLine = unformattedLine = '         ';
        }

        formattedLine += formatValue(value) + suffix;
        unformattedLine += value + suffix;
      });

      sb.push(formattedLine);

      if (isLast)
      {
        if (unformattedLine.length >= MAX_LINE_LENGTH - 1)
        {
          sb.push('\n     ');
        }

        sb.push(')');
      }
    }

    function formatKey(key, isFirst, array, html)
    {
      var str = '';

      if (html)
      {
        str += isFirst
          ? '     <span class="hljs-keyword">IF</span> ('
          : '     <span class="hljs-keyword">AND</span> ';
        str += '<span class="hljs-symbol">' + key + '</span> ';

        if (array)
        {
          str += '<span class="hljs-keyword">IN</span> (';
        }
      }
      else
      {
        str += isFirst
          ? '     IF ('
          : '     AND ';
        str += key + ' ';

        if (array)
        {
          str += ' IN (';
        }
      }

      return str;
    }

    function formatOperator(value)
    {
      var firstC = value.charAt(0);
      var operator = '=';

      if (firstC === '<' || firstC === '>')
      {
        var matches = value.match(/^([<>][>=]?)(.*?)$/);

        operator = matches[1];
        value = matches[2].trim();
      }

      return operator + ' ' + formatValue(value);
    }

    function formatValue(value)
    {
      if (options.html)
      {
        var type = /^[0-9]+(\.[0-9]+)?$/.test(value) ? 'number' : 'string';

        return '<span class="hljs-' + type + '">' + value + '</span>';
      }

      return value;
    }
  };
});
