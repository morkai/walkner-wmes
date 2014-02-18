define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  './decorateProdDowntime',
  'app/prodDowntimes/templates/corroborate'
], function(
  _,
  t,
  time,
  user,
  viewport,
  View,
  decorateProdDowntime,
  detailsTemplate
) {
  'use strict';

  return View.extend({

    template: detailsTemplate,

    events: {
      'click .btn-success': function()
      {
        this.corroborate('confirmed');
      },
      'click .btn-danger': function()
      {
        this.corroborate('rejected');
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('cpdv');

      this.listenTo(this.model, 'change:finishedAt', function()
      {
        this.$('.prodDowntimes-corroborate-finishedAt').text(
          time.format(this.model.get('finishedAt'), 'YYYY-MM-DD HH:mm:ss')
        );
      });
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        model: decorateProdDowntime(this.model),
        cancelUrl: this.options.cancelUrl || '#'
      };
    },

    corroborate: function(status)
    {
      var $comment = this.$id('decisionComment');
      var $confirmBtn = this.$('.btn-success').attr('disabled', true);
      var $rejectBtn = this.$('.btn-danger').attr('disabled', true);
      var $statusBtn = status === 'confirmed' ? $confirmBtn : $rejectBtn;

      $statusBtn.prepend('<i class="fa fa-spinner fa-spin"></i> ');

      var data = {
        _id: this.model.id,
        corroborator: user.getInfo(),
        status: status,
        decisionComment: $comment.val().trim()
      };

      this.socket.emit('prodDowntimes.corroborate', data, function(err)
      {
        if (err)
        {
          viewport.msg.show({
            type: 'error',
            time: 5000,
            text: t('prodDowntimes', 'corroborate:msg:failure', {error: err.message})
          });

          $confirmBtn.attr('disabled', false);
          $rejectBtn.attr('disabled', false);
        }

        $statusBtn.find('.fa-spinner').remove();
      });
    }

  });
});
