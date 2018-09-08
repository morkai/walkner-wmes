// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/pkhdStrategies/templates/form'
], function(
  _,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'input #-s': 'validateId',
      'input #-t': 'validateId',
      'blur #-s': 'validateIdNow',
      'blur #-t': 'validateIdNow'

    }, FormView.prototype.events),

    validateId: function()
    {
      clearTimeout(this.timers.validateId);

      this.timers.validateId = setTimeout(this.validateIdNow.bind(this), 333);
    },

    validateIdNow: function()
    {
      var view = this;
      var s = view.$id('s').val().trim();
      var t = view.$id('t').val().trim();
      var req = view.ajax({
        url: '/pkhdStrategies?s=' + s + '&t=' + t + '&_id=ne=' + this.model.id
      });

      req.done(function(res)
      {
        if (res.collection.length)
        {
          view.$id('alreadyExists')
            .prop('href', '#pkhdStrategies/' + res.collection[0]._id + ';edit')
            .removeClass('hidden');
        }
        else
        {
          view.$id('alreadyExists').addClass('hidden');
        }
      });

      req.fail(function()
      {
        view.$id('alreadyExists').addClass('hidden');
      });
    }

  });
});
