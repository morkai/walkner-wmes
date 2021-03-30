// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/wmes-dummyPaint-families/templates/form'
], function(
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: Object.assign({

      'input #-_id': function()
      {
        this.scheduleIdCheck();
      }

    }, FormView.prototype.events),

    scheduleIdCheck: function()
    {
      if (this.options.editMode)
      {
        return;
      }

      this.$id('duplicateKey').addClass('hidden');

      if (this.checkReq)
      {
        this.checkReq.abort();
        this.checkReq = null;
      }

      clearTimeout(this.timers.checkId);
      this.timers.checkId = setTimeout(this.checkId.bind(this), 250);

      this.$('.btn-primary').prop('disabled', true);
    },

    checkId: function()
    {
      var view = this;
      var id = view.$id('_id').val().trim();
      var req = view.checkReq = view.ajax({
        method: 'HEAD',
        url: '/dummyPaint/families/' + encodeURIComponent(id)
      });

      req.fail(function()
      {
        view.$id('duplicateKey').addClass('hidden');
      });

      req.done(function()
      {
        view.$id('duplicateKey')
          .attr('href', '#dummyPaint/families/' + encodeURIComponent(id) + ';edit')
          .removeClass('hidden');
      });

      req.always(function()
      {
        view.$('.btn-primary').prop('disabled', false);
      });
    },

    getFailureText: function(jqXhr)
    {
      if (jqXhr.responseJSON && jqXhr.responseJSON.error && jqXhr.responseJSON.error.code === 'DUPLICATE_KEY')
      {
        return this.t('FORM:ERROR:duplicateKey');
      }

      return FormView.prototype.getFailureText.apply(this, arguments);
    }

  });
});
