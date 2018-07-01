// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n'
], function(
  _,
  t
) {
  'use strict';

  function props(model, options)
  {
    if (!options)
    {
      options = model;
      model = options.model;
    }

    var html = '<div class="props ' + (options.first ? 'first' : '') + '">';

    [].concat(_.isArray(options) ? options : options.props).forEach(function(prop)
    {
      if (typeof prop === 'string')
      {
        prop = {id: prop};
      }

      var escape = prop.id.charAt(0) !== '!';
      var id = escape ? prop.id : prop.id.substring(1);
      var className = prop.className || '';
      var nlsDomain = prop.nlsDomain || options.nlsDomain || model.nlsDomain;
      var label = prop.label || t(nlsDomain, 'PROPERTY:' + id);
      var value = escape ? _.escape(model[id]) : model[id];

      html += '<div class="prop ' + className + '" data-prop="' + id + '">'
        + '<div class="prop-name">' + label + '</div>'
        + '<div class="prop-value">' + value + '</div>'
        + '</div>';
    });

    return html + '</div>';
  }

  return props;
});
