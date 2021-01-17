// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/core/View',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/planning-orderGroups/templates/tester/filter'
], function(
  js2form,
  View,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    nlsDomain: 'planning-orderGroups',

    events: {
      'submit': function()
      {
        this.model.set({
          date: this.$id('date').val(),
          mrp: this.$id('mrp').val()
        });

        this.model.trigger('filtered');

        return false;
      }
    },

    afterRender: function()
    {
      js2form(this.el, {
        date: this.model.get('date'),
        mrp: this.model.get('mrp')
      });

      setUpMrpSelect2(this.$id('mrp'), {
        multiple: false,
        allowClear: false
      });
    }

  });
});
