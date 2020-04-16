// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/viewport',
  'app/core/views/DialogView',
  'app/planning/templates/toggleLockDialog'
], function(
  user,
  viewport,
  DialogView,
  template
) {
  'use strict';

  return DialogView.extend({

    template: template,

    nlsDomain: 'planning',

    afterRender: function()
    {
      DialogView.prototype.initialize.apply(this, arguments);

      if (this.model.locked)
      {
        this.checkMrpLock();
      }
    },

    checkMrpLock: function()
    {
      var view = this;

      viewport.msg.loading();

      var req = view.ajax({
        method: 'POST',
        url: '/old/wh;check-mrp-lock',
        data: JSON.stringify({
          date: view.model.date,
          mrp: view.model.mrp
        })
      });

      req.fail(function()
      {
        viewport.msg.loadingFailed();
      });

      req.done(function(res)
      {
        viewport.msg.loaded();

        if (res.locked === false)
        {
          view.$id('yes').prop('disabled', false).focus();

          return;
        }

        view.$id('warning').removeClass('hidden');

        if (user.isAllowedTo('SUPER'))
        {
          view.$id('yes').prop('disabled', false).focus();
        }
      });
    }

  });
});
