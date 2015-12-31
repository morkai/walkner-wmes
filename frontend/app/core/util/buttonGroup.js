// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  return {

    toggle: function($group)
    {
      $group.find('input:checked').parent().addClass('active');
    },

    getValue: function($group)
    {
      var $inputs = $group.find('input');

      if (!$inputs.length)
      {
        return null;
      }

      if ($inputs[0].type === 'radio' || $inputs.length === 1)
      {
        return $inputs.filter(':checked').val();
      }

      return $inputs.filter(':checked').map(function() { return this.value; }).get();
    }

  };
});
