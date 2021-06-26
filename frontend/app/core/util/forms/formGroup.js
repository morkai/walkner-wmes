// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/html'
], function(
  html
) {
  'use strict';

  var NO_FORM_CONTROL_TYPES = {
    select2: true,
    static: true
  };

  return function formGroup(view, options)
  {
    if (typeof options === 'string')
    {
      options = {name: options};
    }

    if (options.visible === false || options.hidden)
    {
      return '';
    }

    if (!options.name && options.id)
    {
      options.name = options.id;
    }

    if (!options.type)
    {
      options.type = 'text';
    }

    var id = view.idPrefix + '-' + (options.id || options.name.replace(/[\[\].]/g, '-'));
    var formGroupAttrs = Object.assign({
      className: html.className(
        'form-group',
        options.groupClassName,
        options.required && options.type === 'select2' ? 'has-required-select2' : null
      ),
      style: options.groupStyle || false
    }, options.groupAttrs);
    var labelTag = '';
    var helpBlockTag = '';
    var inputTag = 'input';
    var inputAttrs = {
      id: id,
      name: options.name,
      type: 'text',
      required: options.required === true,
      disabled: options.disabled === true,
      readonly: options.readOnly === true,
      placeholder: options.placeholder || false,
      style: options.inputStyle || false
    };
    var inputInner = '';
    var inputClassNames = [options.noFormControl || NO_FORM_CONTROL_TYPES[options.type] ? '' : 'form-control'];
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
        className: html.className(labelClassName, options.labelClassName),
        style: options.labelStyle || false
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
        className: html.className('help-block', options.helpBlockClassName),
        style: options.helpBlockStyle || false
      }, options.helpBlockAttrs);

      helpBlockTag = html.tag('span', helpBlockAttrs, helpBlockText);
    }

    switch (options.type)
    {
      case 'number':
      case 'date':
      case 'month':
        inputAttrs.type = options.type;
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

      case 'static':
        inputTag = 'p';
        inputAttrs.type = false;
        inputAttrs.name = false;
        inputAttrs.required = false;
        inputAttrs.disabled = false;
        inputAttrs.readonly = false;
        inputInner = options.value == null ? '' : String(options.value);
        inputClassNames.push('form-control-static');
        break;

      case 'text':
        inputAttrs.pattern = options.pattern || false;
        inputAttrs.maxlength = options.maxLength > 0 ? options.maxLength : false;
        break;

      case 'file':
        inputAttrs.type = options.type;
        inputAttrs.multiple = options.multiple === true;
        inputAttrs.accept = options.accept || false;
        break;

      case 'select':
        inputTag = 'select';
        inputAttrs.type = false;
        inputAttrs.multiple = options.multiple === true;
        inputAttrs.size = options.size || 1;

        if (options.expandable)
        {
          inputAttrs.multiple = true;

          if (!/]$/.test(inputAttrs.name))
          {
            inputAttrs.name += '[]';
          }

          inputClassNames.push('is-expandable');
        }

        if (options.emptyOption)
        {
          inputInner = html.tag('option');
        }

        options.options.forEach(function(option)
        {
          inputInner += html.tag('option', Object.assign({}, option, {label: false}), option.label);
        });
        break;
    }

    inputAttrs.className = html.className(inputClassNames, options.inputClassName);

    Object.assign(inputAttrs, options.inputAttrs);

    return html.tag('div', formGroupAttrs, labelTag + helpBlockTag + html.tag(inputTag, inputAttrs, inputInner));
  };
});
