// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/rewardReportFilter',
  'app/core/util/ExpandableSelect'
], function(
  js2form,
  View,
  idAndLabel,
  setUpUserSelect2,
  kaizenDictionaries,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function()
      {
        this.changeFilter();

        return false;
      }
    },

    destroy: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      setUpUserSelect2(this.$id('confirmer'), {
        view: this,
        width: '285px'
      });

      this.$id('sections').select2({
        width: '350px',
        allowClear: true,
        multiple: true,
        data: kaizenDictionaries.sections
          .filter(function(section) { return section.get('active'); })
          .map(idAndLabel)
      });

      this.$('.is-expandable').expandableSelect();
    },

    serializeFormData: function()
    {
      var model = this.model;

      return {
        month: model.get('month'),
        confirmer: model.get('confirmer'),
        sections: model.get('sections').join(',')
      };
    },

    changeFilter: function()
    {
      var query = {
        month: this.$id('month').val(),
        confirmer: this.$id('confirmer').val() || null,
        sections: this.$id('sections').val().split(',').filter(function(v) { return !!v; })
      };

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
