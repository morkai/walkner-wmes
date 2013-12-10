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
        var answer = this.$(e.target).closest('.dialog-answer').attr('data-answer');

        if (_.isString(answer) && answer.length > 0)
        {
          this.trigger('answered', answer);

          if (_.isFunction(this.closeDialog))
          {
            this.closeDialog();
          }
        }
      }
    },

    serialize: function()
    {
      return this.model;
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = this.options.autoHide === false
        ? function() {}
        : viewport.closeDialog.bind(viewport);
    }

  });
});
