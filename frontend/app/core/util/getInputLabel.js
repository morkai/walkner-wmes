// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery'
], function(
  $
) {
  'use strict';

  return function getInputLabel(input)
  {
    if (input && input instanceof $)
    {
      input = input[0];
    }

    if (!input)
    {
      return null;
    }

    if (input.labels)
    {
      return $(input.labels[0]);
    }

    if (input.id)
    {
      var label = document.querySelector('label[for="' + input.id + '"]');

      if (label)
      {
        return $(label);
      }
    }

    return $(input).closest('label');
  };
});
