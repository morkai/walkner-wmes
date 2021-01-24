// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/util/embedded',
  'app/core/util/html',
  'app/core/templates/forms/embeddedPicker'
], function(
  _,
  $,
  viewport,
  embedded,
  html,
  template
) {
  'use strict';

  function prepareFilter(value)
  {
    return value.toUpperCase().replace(/[^A-Z0-9]+/g, '');
  }

  function renderOptions($picker, opts)
  {
    var filter = prepareFilter($picker.find('.form-embeddedPicker-filter').val());
    var html = '';
    var $value = $picker.find('.form-embeddedPicker-value');
    var value = $value.val();

    opts.forEach(function(opt)
    {
      if (opt.filter.indexOf(filter) !== -1)
      {
        html += '<button class="btn btn-default ' + (opt.value === value ? 'active' : '')
          + '" type="button" value="' + opt.value + '">'
          + '<span class="form-embeddedPicker-label">' + opt.label + '</span>'
          + '<span class="form-embeddedPicker-description">' + opt.description + '</span>'
          + '</button>';
      }
    });

    $picker.find('.form-embeddedPicker-options').html(html);
  }

  return function embeddedPicker($el, options)
  {
    options = Object.assign({
      label: '?',
      placeholder: '',
      filter: '',
      options: []
    }, options);

    var $picker = $(template({
      required: $el.prop('required'),
      label: options.label,
      placeholder: options.placeholder,
      filter: options.filter
    }));
    var opts = options.options
      .map(function(option)
      {
        return {
          value: _.escape(option.value),
          label: _.escape(option.label || option.value),
          description: _.escape(option.description || ''),
          filter: prepareFilter((option.label || option.value) + (option.description || ''))
        };
      })
      .sort(function(a, b)
      {
        return a.label.localeCompare(b.label, undefined, {numeric: true, ignorePunctuation: true});
      });

    $picker.find('.form-embeddedPicker-clear').on('click', function()
    {
      $el.val('');
      $picker.find('.form-embeddedPicker-selected').text(options.placeholder);
    });

    $picker.find('.form-embeddedPicker-selected').on('click', function()
    {
      $picker.addClass('form-embeddedPicker-selecting');
      $picker.find('.form-embeddedPicker-filter').val('').focus();
      renderOptions($picker, opts);

      var $active = $picker.find('.active');

      if ($active.length)
      {
        $active[0].scrollIntoView();
      }
      else
      {
        $picker.find('.form-embeddedPicker-options')[0].scrollTop = 0;
      }

      viewport.adjustDialogBackdrop();
    });

    $picker.find('.form-embeddedPicker-filter').on('input', function()
    {
      renderOptions($picker, opts);
    });

    $picker.find('.form-embeddedPicker-options').on('click', '.btn', function(e)
    {
      $el.val(e.currentTarget.value);
      $picker.find('.form-embeddedPicker-selected').html(e.currentTarget.innerHTML);
      $picker.removeClass('form-embeddedPicker-selecting');

      viewport.adjustDialogBackdrop();
    });

    $picker.insertAfter($el);

    $el
      .addClass('form-embeddedPicker-value')
      .appendTo($picker.find('.form-embeddedPicker-buttons'));

    var $selected = $picker.find('.form-embeddedPicker-selected');

    $selected.css('width', $selected.outerWidth() + 'px');

    viewport.adjustDialogBackdrop();
  };
});
