// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  function formatTag(name, attrs, inner)
  {
    var html = '<' + name + formatAttrs(attrs) + '>';

    if (typeof inner === 'string')
    {
      html += inner + '</' + name + '>';
    }

    return html;
  }

  function formatAttrs(attrs)
  {
    var html = '';

    if (!attrs)
    {
      return html;
    }

    Object.keys(attrs).forEach(function(k)
    {
      var v = attrs[k];

      if (v === false)
      {
        return;
      }

      if (k === 'className')
      {
        k = 'class';
      }
      else if (k === 'style' && !!v && typeof v === 'object')
      {
        var styles = '';

        Object.keys(v).forEach(function(k)
        {
          styles += k + ':' + v[k] + ';';
        });

        v = styles;
      }
      else if (k === 'data' && !!v && typeof v === 'object')
      {
        Object.keys(v).forEach(key =>
        {
          html += ' data-' + key + '="' + v[key] + '"';
        });

        return;
      }

      html += ' ' + k;

      if (v != null && v !== true)
      {
        if (k === 'class' && typeof v !== 'string')
        {
          v = formatClassName(v);
        }

        html += '="' + v + '"';
      }
    });

    return html;
  }

  function formatClassName()
  {
    var classNames = [];

    for (var i = 0; i < arguments.length; ++i)
    {
      var classes = arguments[i];

      if (!classes)
      {
        continue;
      }

      if (typeof classes === 'string')
      {
        classNames.push(classes);
      }
      else if (Array.isArray(classes))
      {
        classNames = classNames.concat(classes);
      }
      else if (classes)
      {
        Object.keys(classes).forEach(function(k) // eslint-disable-line no-loop-func
        {
          if (classes[k])
          {
            classNames.push(k);
          }
        });
      }
    }

    return classNames.join(' ');
  }

  return {

    tag: formatTag,
    attrs: formatAttrs,
    className: formatClassName

  };
});
