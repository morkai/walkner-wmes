// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'Sortable',
  'app/core/util/idAndLabel',
  'app/data/prodFunctions',
  'app/settings/views/SettingsView',
  'app/mor/templates/settings'
], function(
  _,
  Sortable,
  idAndLabel,
  prodFunctions,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#mor;settings',

    template: template,

    localTopics: {
      'prodFunctions.synced': 'render'
    },

    events: _.assign({
      'change input[data-setting]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      }
    }, SettingsView.prototype.events),

    initialize: function()
    {
      SettingsView.prototype.initialize.apply(this, arguments);

      this.sortable = null;
    },

    destroy: function()
    {
      SettingsView.prototype.destroy.apply(this, arguments);

      this.sortable.destroy();
      this.sortable = null;
    },

    afterRender: function()
    {
      SettingsView.prototype.afterRender.apply(this, arguments);

      var $prodFunctions = this.$id('prodFunctions').select2({
        allowClear: true,
        multiple: true,
        data: prodFunctions.map(idAndLabel)
      });

      this.sortable = new Sortable($prodFunctions.select2('container').find('.select2-choices')[0], {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: function()
        {
          $prodFunctions.select2('onSortStart');
        },
        onEnd: function()
        {
          $prodFunctions.select2('onSortEnd').select2('focus');
        }
      });

      this.$id('globalProdFunctions').select2({
        allowClear: true,
        multiple: true,
        data: prodFunctions.map(idAndLabel)
      });

      this.$id('commonProdFunctions').select2({
        allowClear: true,
        multiple: true,
        data: prodFunctions.map(idAndLabel)
      });

      this.$id('orderedProdFunctions').select2({
        allowClear: true,
        multiple: true,
        data: prodFunctions.map(idAndLabel)
      });
    }

  });
});
