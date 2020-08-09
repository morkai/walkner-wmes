// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/html'
], function(
  html
) {
  'use strict';

  return function formGroup(view, options)
  {
    if (typeof options === 'string')
    {
      options = {name: options};
    }

    var id = view.idPrefix + '-' + (options.id || options.name.replace(/\./g, '-'));
    var formGroupAttrs = Object.assign({
      className: html.className('form-group', options.groupClassName)
    }, options.groupAttrs);
    var labelTag = '';
    var helpBlockTag = '';
    var inputTag = 'input';
    var inputAttrs = {
      id: id,
      name: options.name,
      type: 'text',
      required: options.required === true
    };
    var inputInner = '';
    var inputClassNames = [options.noFormControl || options.type === 'select2' ? '' : 'form-control'];
    var labelOption = options.label;

    if (labelOption !== false)
    {
      if (/:$/.test(labelOption))
      {
        labelOption += options.name;
      }

      var labelText = labelOption || options.name;

      if (view.t.has(labelText))
      {
        labelText = view.t(labelText);
      }

      var labelClassName = [options.noControlLabel ? '' : 'control-label'];

      if (options.required)
      {
        labelClassName.push('is-required');
      }

      var labelAttrs = Object.assign({
        for: id,
        className: html.className(labelClassName, options.labelClassName)
      }, options.labelAttrs);

      labelTag = html.tag('label', labelAttrs, labelText);
    }

    if (options.helpBlock)
    {
      var helpBlockText = options.helpBlock === true ? (labelOption || options.name) : options.helpBlock;

      if (view.t.has(helpBlockText + ':help'))
      {
        helpBlockText = view.t(helpBlockText + ':help');
      }
      else if (view.t.has(helpBlockText))
      {
        helpBlockText = view.t(helpBlockText);
      }

      var helpBlockAttrs = Object.assign({
        className: html.className('help-block', options.helpBlockClassName)
      }, options.helpBlockAttrs);

      helpBlockTag = html.tag('span', helpBlockAttrs, helpBlockText);
    }

    switch (options.type)
    {
      case 'number':
        inputAttrs.type = 'number';
        inputAttrs.min = options.min == null ? false : options.min;
        inputAttrs.max = options.max == null ? false : options.max;
        inputAttrs.step = options.step == null ? false : options.step;
        inputAttrs.value = options.value;
        break;

      case 'textarea':
        inputTag = 'textarea';
        inputAttrs.type = false;
        inputAttrs.rows = options.rows == null ? false : options.rows;
        inputAttrs.cols = options.cols == null ? false : options.cols;
        inputInner = options.value == null ? '' : String(options.value);
        break;
    }

    inputAttrs.className = html.className(inputClassNames, options.inputClassName);

    Object.assign(inputAttrs, options.inputAttrs);

    return html.tag('div', formGroupAttrs, labelTag + helpBlockTag + html.tag(inputTag, inputAttrs, inputInner));
  };
});
