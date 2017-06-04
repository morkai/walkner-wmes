// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/formatResultWithDescription',
  'app/data/orgUnits',
  'app/users/util/setUpUserSelect2',
  'app/mor/templates/mrpForm'
], function(
  t,
  viewport,
  View,
  formatResultWithDescription,
  orgUnits,
  setUpUserSelect2,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'change #-mrp': function()
      {
        var mrp = orgUnits.getByTypeAndId('mrpController', this.$id('mrp').val());

        if (mrp)
        {
          this.$id('description').val(mrp.get('description'));
        }
      },
      'submit': function()
      {
        var view = this;
        var $submit = view.$id('submit').prop('disabled', true);
        var params = {
          section: view.model.section._id,
          mrp: view.model.mrp ? view.model.mrp._id : view.$id('mrp').val(),
          iptCheck: view.$id('iptCheck').prop('checked'),
          iptCheckRecipients: (view.$id('iptCheckRecipients').select2('data') || [])
            .map(function(d) { return d.user; }),
          description: view.$id('description').val()
        };

        view.model.mor[view.model.mrp ? 'editMrp' : 'addMrp'](params)
          .fail(function()
          {
            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: t('mor', 'mrpForm:failure:' + view.model.mode)
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
        mode: this.model.mode,
        section: this.model.section.name,
        mrp: this.model.mrp
      };
    },

    afterRender: function()
    {
      if (this.model.mode === 'edit')
      {
        this.$id('mrp').prop('disabled', true);
      }

      setUpUserSelect2(this.$id('iptCheckRecipients'), {
        view: this,
        multiple: true
      });
    },

    onDialogShown: function()
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id(this.model.mode === 'edit' ? 'description' : 'mrp').focus();
    },

    closeDialog: function() {}

  });
});
