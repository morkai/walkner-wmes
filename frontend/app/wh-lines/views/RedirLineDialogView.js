// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/orgUnits/util/setUpOrgUnitSelect2',
  'app/wh-lines/templates/redirLine',
  'i18n!app/nls/wh-lines'
], function(
  viewport,
  View,
  setUpOrgUnitSelect2,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'submit': function()
      {
        var view = this;

        viewport.msg.saving();

        var $submit = view.$id('submit').prop('disabled', true);

        var req = view.ajax({
          method: 'POST',
          url: '/old/wh;act',
          data: JSON.stringify({
            action: view.model.get('redirLine') ? 'stopRedirLine' : 'startRedirLine',
            data: {
              sourceLine: view.model.id,
              targetLine: view.$id('targetLine').val(),
              redirDelivered: view.$id('redirDelivered').prop('checked')
            }
          })
        });

        req.fail(function()
        {
          var error = req.responseJSON && req.responseJSON.error || null;

          if (error && view.t.has('redirLine:error:' + error.code))
          {
            viewport.msg.saved();
            viewport.msg.show({
              type: 'error',
              time: 5000,
              text: view.t('redirLine:error:' + error.code, error)
            });
          }
          else
          {
            viewport.msg.savingFailed();
          }

          $submit.prop('disabled', false);
        });

        req.done(function()
        {
          viewport.msg.saved();
          viewport.closeDialog();
        });

        return false;
      }

    },

    initialize: function()
    {
      this.listenTo(this.model, 'change:redirLine', function()
      {
        viewport.closeDialog();
      });
    },

    getTemplateData: function()
    {
      return {
        mode: this.model.get('redirLine') ? 'stop' : 'start',
        sourceLine: this.model.id,
        targetLine: this.model.get('redirLine') || ''
      };
    },

    afterRender: function()
    {
      if (!this.model.get('redirLine'))
      {
        setUpOrgUnitSelect2(this.$id('targetLine'), {
          orgUnitType: 'prodLine'
        });
      }
    }

  });
});
