// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/opinionSurveyScanTemplates/templates/imageEditForm'
], function(
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': 'upload'
    },

    upload: function(e)
    {
      e.preventDefault();

      var view = this;
      var $submit = this.$('[type=submit]').attr('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');
      var formData = new FormData(this.el);
      var req = this.ajax({
        type: 'POST',
        url: '/opinionSurveys/scanTemplates;uploadImage',
        data: formData,
        processData: false,
        contentType: false
      });

      req.then(function(res)
      {
        viewport.msg.show({
          type: 'info',
          time: 2500,
          text: t('opinionSurveyScanTemplates', 'imageEditForm:msg:success')
        });

        view.trigger('success', res);
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('opinionSurveyScanTemplates', 'imageEditForm:msg:failure')
        });
      });

      req.always(function()
      {
        $submit.attr('disabled', false);
        $spinner.addClass('hidden');
      });
    }

  });
});
