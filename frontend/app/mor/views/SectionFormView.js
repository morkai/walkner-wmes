// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'Sortable',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/core/util/uuid',
  'app/data/orgUnits',
  'app/data/prodFunctions',
  'app/mor/templates/sectionForm'
], function(
  _,
  Sortable,
  t,
  viewport,
  View,
  idAndLabel,
  uuid,
  orgUnits,
  prodFunctions,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function()
      {
        var view = this;
        var $submit = view.$id('submit').prop('disabled', true);
        var params = {
          _id: this.model.section ? this.model.section._id : uuid(),
          name: view.$id('name').val().trim(),
          watchEnabled: view.$id('watchEnabled').prop('checked'),
          mrpsEnabled: view.$id('mrpsEnabled').prop('checked'),
          subdivisions: view.$id('subdivisions').val().split(',').filter(function(id) { return id !== ''; }),
          prodFunctions: view.$id('prodFunctions').val().split(',').filter(function(id) { return id !== ''; })
        };

        view.model.mor[view.model.section ? 'editSection' : 'addSection'](params)
          .fail(function()
          {
            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: t('mor', 'sectionForm:failure:' + view.model.nlsSuffix)
            });

            $submit.prop('disabled', false);
          })
          .done(function()
          {
            view.closeDialog();
          });

        return false;
      }
    },

    initialize: function()
    {
      this.sortable = null;
    },

    destroy: function()
    {
      this.sortable.destroy();
      this.sortable = null;
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        nlsSuffix: this.model.nlsSuffix,
        section: this.model.section
      };
    },

    afterRender: function()
    {
      this.$id('subdivisions').select2({
        allowClear: true,
        multiple: true,
        data: orgUnits.getAllByType('division').map(function(division)
        {
          var divisionText = division.getLabel();

          return {
            text: divisionText,
            children: orgUnits.getChildren(division).map(function(subdivision)
            {
              return {
                id: subdivision.id,
                text: subdivision.getLabel(),
                divisionText: divisionText
              };
            })
          };
        }),
        formatSelection: function(item, container, e)
        {
          return e(item.divisionText + ' \\ ' + item.text);
        }
      });

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
    },

    onDialogShown: function()
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id('name').focus();
    },

    closeDialog: function() {}

  });
});
