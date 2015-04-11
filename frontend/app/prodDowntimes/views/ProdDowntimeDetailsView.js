// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'underscore',
  'app/time',
  'app/i18n',
  'app/viewport',
  'app/core/views/DetailsView',
  'app/core/util/buttonGroup',
  '../util/decorateProdDowntime',
  '../util/decorateProdDowntimeChange',
  '../util/reasonAndAor',
  'app/prodDowntimes/templates/details',
  'app/prodDowntimes/templates/detailsProps',
  'app/prodDowntimes/templates/historyItem',
  'app/prodDowntimes/templates/corroborateExtra'
], function(
  $,
  _,
  time,
  t,
  viewport,
  DetailsView,
  buttonGroup,
  decorateProdDowntime,
  decorateProdDowntimeChange,
  reasonAndAor,
  detailsTemplate,
  detailsPropsTemplate,
  historyItemTemplate,
  corroborateExtraTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    events: _.extend({
      'select2-removed #-reason, #-aor': function()
      {
        this.$id('reason').val('');
        this.$id('aor').val('');

        this.timers.clearSelect2 = setTimeout(function(view)
        {
          view.setUpReasonSelect2();
          view.setUpAorSelect2();
          view.$id('reason').select2('focus');
        }, 1, this);
      },
      'change #-reason': function()
      {
        this.setUpAorSelect2();
      },
      'change #-aor': function()
      {
        this.setUpReasonSelect2();
      },
      'change #-status': function(e)
      {
        this.updateCorroborateSubmit(e);
      },
      'change #-corroborate': function()
      {
        this.clearCorroborateValidity();
      },
      'submit #-corroborate': function()
      {
        this.corroborate();

        return false;
      }
    }, DetailsView.prototype.events),

    remoteTopics: function()
    {
      return {};
    },

    initialize: function()
    {
      DetailsView.prototype.initialize.apply(this, arguments);
      reasonAndAor.initialize(this);

      this.historyItemCount = 0;
    },

    destroy: function()
    {
      DetailsView.prototype.destroy.call(this);
      reasonAndAor.destroy(this);
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change', this.onModelChange);
      this.stopListening(this.model, 'change:changes', this.updateHistory);
    },

    afterRender: function()
    {
      this.historyItemCount = this.model.get('changes').length;

      this.listenTo(this.model, 'change', this.onModelChange);
      this.listenTo(this.model, 'change:changes', this.updateHistory);

      if (!this.timers.updateTimes)
      {
        this.timers.updateTimes = setInterval(this.updateTimes.bind(this), 30000);
      }

      reasonAndAor.setUpReasons(this);
      reasonAndAor.setUpAors(this);

      this.updateCorroborateExtra();
    },

    focusComment: function()
    {
      this.$id('comment').focus();
    },

    updateProps: function()
    {
      this.$id('props').replaceWith(detailsPropsTemplate({
        idPrefix: this.idPrefix,
        model: decorateProdDowntime(this.model, {longDate: true, noHistory: true})
      }));
    },

    updateHistory: function()
    {
      var $history = this.$id('history');

      $history.find('.prodDowntimes-history-item').remove();

      var $heading = $history.find('.panel-heading');
      var items = this.model.get('changes').map(function(change, i)
      {
        return historyItemTemplate({
          item: decorateProdDowntimeChange(change),
          itemIndex: i
        });
      });

      $heading.after(items.join(''));

      if (items.length > this.historyItemCount)
      {
        var $items = this.$('.prodDowntimes-history-item');

        for (var i = this.historyItemCount; i < $items.length; ++i)
        {
          $items[i].classList.add('highlight');
        }

        this.historyItemCount = items.length;
      }
    },

    updateCorroborateExtra: function()
    {
      var $extra = this.$id('corroborateExtra');

      if ($extra.length)
      {
        return;
      }

      if (!this.model.canChangeStatus())
      {
        this.$id('reason').select2('destroy');
        this.$id('aor').select2('destroy');
        $extra.remove();
        this.updateCorroborateSubmit();

        return;
      }

      this.$id('corroborate').prepend(corroborateExtraTemplate({
        idPrefix: this.idPrefix,
        showRejectedStatus: true,
        showConfirmedStatus: true
      }));

      this.$id('reason').val(this.model.get('reason'));
      this.$id('aor').val(this.model.get('aor'));

      this.setUpReasonSelect2();
      this.setUpAorSelect2();
      this.updateCorroborateSubmit();
    },

    updateCorroborateSubmit: function(e)
    {
      var $status = this.$id('status');
      var status = buttonGroup.getValue($status);

      if (!status || status.length === 0)
      {
        status = 'undecided';
      }
      else if (status.length === 1)
      {
        status = status[0];
      }
      else if (e)
      {
        $status
          .find('input')
          .filter(function() { return this !== e.target; })
          .prop('checked', false)
          .parent()
          .removeClass('active');

        status = e.target.value;
      }

      var undecided = status === 'undecided';
      var icon = undecided ? 'comment' : 'gavel';
      var className = undecided ? 'primary' : status === 'rejected' ? 'danger' : 'success';
      var label = '<i class="fa fa-' + icon + '"></i><span>'
        + t('prodDowntimes', 'corroborate:submit:' + status)
        + '</span>';

      this.$('button[type="submit"]')
        .removeClass('btn-primary btn-success btn-danger')
        .addClass('btn-' + className)
        .html(label);

      this.$id('reason').closest('.form-group').toggleClass('hidden', undecided);
      this.$id('aor').closest('.form-group').toggleClass('hidden', undecided);
      this.$id('comment')
        .prop('required', undecided)
        .closest('.form-group')
        .find('label')
        .toggleClass('is-required', undecided);
    },

    setUpReasonSelect2: function()
    {
      reasonAndAor.setUpReasonSelect2(this, this.$id('aor').val(), {
        allowClear: true,
        placeholder: ' '
      });
    },

    setUpAorSelect2: function()
    {
      reasonAndAor.setUpAorSelect2(this, this.$id('reason').val(), {
        allowClear: true,
        placeholder: ' '
      });
    },

    updateTimes: function()
    {
      this.$('.prodDowntimes-history-time').each(function()
      {
        var tagData = time.toTagData(this.getAttribute('datetime'));

        this.innerText = tagData.daysAgo > 5 ? tagData.long : tagData.human;
      });
    },

    clearCorroborateValidity: function()
    {
      var el = this.$id('comment')[0];

      if (el)
      {
        el.setCustomValidity('');
      }
    },

    corroborate: function()
    {
      var $comment = this.$id('comment');
      var newStatus = buttonGroup.getValue(this.$id('status'));
      var newReason =  this.$id('reason').val();
      var newAor = this.$id('aor').val();
      var comment = $comment.val().trim();
      var data = {};

      if (Array.isArray(newStatus) && newStatus.length)
      {
        newStatus = newStatus[0];

        if (newStatus !== this.model.get('status'))
        {
          data.status = newStatus;
        }

        if (newReason !== this.model.get('reason'))
        {
          data.reason = newReason;
        }

        if (newAor !== this.model.get('aor'))
        {
          data.aor = newAor;
        }
      }

      if (!_.isEmpty(comment))
      {
        data.decisionComment = comment;
      }

      var $submit = this.$('.btn[type="submit"]');

      if (_.isEmpty(data))
      {
        if (!$comment[0].validity.valid)
        {
          return;
        }

        $comment[0].setCustomValidity('Nie wykryto żadnych zmian :(');

        this.timers.submit = setTimeout(function() { $submit.click(); }, 1);

        return;
      }

      data._id = this.model.id;

      if (_.isEmpty(data.decisionComment))
      {
        data.decisionComment = '';
      }

      $submit.prop('disabled', true);

      var view = this;

      this.socket.emit('prodDowntimes.corroborate', data, function(err)
      {
        if (err)
        {
          viewport.msg.show({
            type: 'error',
            time: 2500,
            text: t('prodDowntimes', 'corroborate:failure')
          });
        }
        else
        {
          view.$id('status').find('.active').click();
          $comment.val('').focus();
        }

        $submit.prop('disabled', false);
      });
    },

    onModelChange: function()
    {
      this.updateProps();
      this.updateCorroborateExtra();
    }

  });
});
