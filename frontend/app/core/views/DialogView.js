// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../View'
], function(
  _,
  View
) {
  'use strict';

  return View.extend({

    events: {
      'click .dialog-answer': function(e)
      {
        var $answer = this.$(e.target).closest('.dialog-answer');
        var answer = $answer.attr('data-answer');

        if (_.isString(answer) && answer.length > 0)
        {
          this.disableAnswers();

          this.trigger('answered', answer);

          if (this.options.autoHide !== false && _.isFunction(this.closeDialog))
          {
            this.closeDialog();
          }
        }
      }
    },

    serialize: function()
    {
      return _.assign(
        View.prototype.serialize.apply(this, arguments),
        this.model
      );
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    disableAnswers: function()
    {
      this.$('.btn[data-answer]').prop('disabled', true);
    },

    enableAnswers: function()
    {
      this.$('.btn[data-answer]').prop('disabled', false);
    },

    closeDialog: function() {}

  });
});
