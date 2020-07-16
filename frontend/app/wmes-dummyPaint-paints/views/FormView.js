// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/wmes-dummyPaint-orders/dictionaries',
  'app/wmes-dummyPaint-paints/templates/form'
], function(
  FormView,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: Object.assign({

      'change #-code': 'scheduleDuplicateCheck',
      'change #-family': 'scheduleDuplicateCheck'

    }, FormView.prototype.events),

    getTemplateData: function()
    {
      return {
        paintCodes: dictionaries.paintCodes,
        paintFamilies: dictionaries.paintFamilies
      };
    },

    scheduleDuplicateCheck: function()
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

      clearTimeout(this.timers.checkDuplicate);
      this.timers.checkDuplicate = setTimeout(this.checkDuplicate.bind(this), 250);

      this.$('.btn-primary').prop('disabled', true);
    },

    checkDuplicate: function()
    {
      var view = this;
      var code = view.$id('code').val().trim().toUpperCase();
      var family = view.$id('family').val().trim().toUpperCase();

      if (!code || !family)
      {
        view.$id('duplicateKey').addClass('hidden');
        view.$('.btn-primary').prop('disabled', false);

        return;
      }

      var req = view.checkReq = view.ajax({
        method: 'GET',
        url: '/dummyPaint/paints?code=' + encodeURIComponent(code) + '&family=' + encodeURIComponent(family)
      });

      req.fail(function()
      {
        view.$id('duplicateKey').addClass('hidden');
      });

      req.done(function(res)
      {
        if (res.totalCount === 1)
        {
          view.$id('duplicateKey')
            .attr('href', '#dummyPaint/paints/' + res.collection[0]._id + ';edit')
            .removeClass('hidden');
        }
        else
        {
          view.$id('duplicateKey').addClass('hidden');
        }
      });

      req.done(function()
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
