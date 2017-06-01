// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/formatResultWithDescription',
  'app/data/orgUnits',
  'app/mor/templates/addMrpForm'
], function(
  t,
  viewport,
  View,
  formatResultWithDescription,
  orgUnits,
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
          division: view.model.divisionId,
          mrp: view.$id('mrp').val()
        };

        view.model.mor.addMrp(params)
          .fail(function()
          {
            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: t('mor', 'addMrp:failure')
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

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        division: orgUnits.getByTypeAndId('division', this.model.divisionId).get('description')
      };
    },

    afterRender: function()
    {
      this.$id('mrp').select2({
        data: orgUnits.getAllByType('mrpController')
          .filter(function(mrp) { return !mrp.get('deactivatedAt'); })
          .map(function(mrp)
          {
            return {
              id: mrp.id,
              text: mrp.id,
              description: mrp.get('description')
            };
          }),
        formatResult: formatResultWithDescription.bind(null, 'text', 'description')
      });
    },

    onDialogShown: function()
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id('mrp').focus();
    },

    closeDialog: function() {}

  });
});
