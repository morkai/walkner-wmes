// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore',
  'js2form',
  'Sortable',
  'app/i18n',
  'app/data/orgUnits',
  'app/core/View',
  'app/factoryLayout/templates/orgUnitPicker'
], function(
  $,
  _,
  js2form,
  Sortable,
  t,
  orgUnits,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        var type = this.$('input[name="orgUnitType"]:checked').val();
        var ids = this.$id(type).select2('val');

        this.trigger('picked', type, ids);
      },
      'change input[type="radio"]': function(e)
      {
        this.$id(e.currentTarget.value).select2('focus');
      }
    },

    initialize: function()
    {
      this.sortables = [];
    },

    destroy: function()
    {
      this.destroySortables();
    },

    destroySortables: function()
    {
      for (var i = 0, l = this.sortables.length; i < l; ++i)
      {
        this.sortables[i].destroy();
      }

      this.sortables = [];
    },

    beforeRender: function()
    {
      this.destroySortables();
    },

    afterRender: function()
    {
      var formData = this.serializeFormData();

      js2form(this.el, formData);

      this.setUpOrgUnitSelect2('division');
      this.setUpOrgUnitSelect2('subdivision');
      this.setUpOrgUnitSelect2('mrpController');
      this.setUpOrgUnitSelect2('prodFlow');
      this.setUpOrgUnitSelect2('workCenter');
      this.setUpOrgUnitSelect2('prodLine');

      this.$id(formData.orgUnitType).attr('autofocus', true);
    },

    serializeFormData: function()
    {
      var formData = {
        orgUnitType: this.model.orgUnitType
      };

      formData[formData.orgUnitType] = this.model.orgUnitIds.join(',');

      return formData;
    },

    setUpOrgUnitSelect2: function(type)
    {
      var $input = this.$id(type);

      $input.select2({
        multiple: true,
        data: orgUnits
          .getAllByType(type)
          .map(function(orgUnit)
          {
            if (type === 'division' && orgUnit.get('type') !== 'prod')
            {
              return null;
            }

            var text;

            if (type === 'subdivision')
            {
              if (orgUnit.get('type') === 'storage')
              {
                return null;
              }

              text = orgUnit.get('division') + ' > ' + orgUnit.getLabel();
            }
            else
            {
              text = orgUnit.getLabel();
            }

            return {
              id: orgUnit.id,
              text: text
            };
          })
          .filter(function(item) { return item !== null; })
          .sort(function(a, b) { return a.text.localeCompare(b.text); })
      });

      var choicesEl = $input.select2('container').find('.select2-choices')[0];

      if (!choicesEl)
      {
        return;
      }

      this.sortables.push(new Sortable(choicesEl, {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: function()
        {
          $input.select2('onSortStart');
        },
        onEnd: function()
        {
          $input.select2('onSortEnd').select2('focus');
        }
      }));
    }

  });
});
