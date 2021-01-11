// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/util/html',
  'app/core/templates/forms/dropdownRadio'
], function(
  _,
  $,
  html,
  template
) {
  'use strict';

  return function dropdownRadio($el, options)
  {
    options = Object.assign({
      label: '?',
      options: []
    }, options);

    var $dropdownRadio = $(template({
      label: options.label,
      options: options.options
    }));

    $dropdownRadio.on('click', '.dropdown-menu a', function(e)
    {
      var i = $(e.currentTarget).parent().index();
      var option = options.options[i];

      $el.val(option.value).trigger('change');
    });

    $el.on('change', function()
    {
      updateSelectedLabel();
    });

    $dropdownRadio.insertAfter($el);
    $el.appendTo($dropdownRadio);

    updateSelectedLabel();

    function updateSelectedLabel()
    {
      var value = $el.val();
      var option = options.options.find(function(option) { return option.value === value; });

      if (!option)
      {
        option = options.options[0];
        $el.val(option.value);
      }

      var label = option.selectedLabel || option.optionLabel;

      $dropdownRadio.find('.dropdownRadio-selectedLabel').text(label);
    }
  };
});
