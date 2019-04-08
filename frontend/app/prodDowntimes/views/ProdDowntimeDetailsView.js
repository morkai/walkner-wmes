// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore',
  'app/time',
  'app/i18n',
  'app/viewport',
  'app/core/views/DetailsView',
  'app/core/util/buttonGroup',
  'app/data/orgUnits',
  'app/data/aors',
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
  orgUnits,
  aors,
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

    events: _.assign({
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

      reasonAndAor.setUpReasons(this, null, this.model.get('subdivision'));
      reasonAndAor.setUpAors(this);

      this.updateCorroborateExtra();
    },

    focusComment: function()
    {
      this.$id('comment').focus();
    },

    updateProps: function()
    {
      this.$id('props').replaceWith(this.renderPartialHtml(detailsPropsTemplate, {
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
      var canChangeStatus = this.model.canChangeStatus(this.settings.getCanChangeStatusOptions());

      this.$id('reason').select2('destroy');
      this.$id('aor').select2('destroy');
      $extra.remove();
      this.updateCorroborateSubmit();

      if (!canChangeStatus)
      {
        return;
      }

      var defaultAor = this.getDefaultAor();
      var status = this.model.get('status');

      this.$id('corroborate').prepend(this.renderPartial(corroborateExtraTemplate, {
        defaultAor: defaultAor ? defaultAor.getLabel() : null,
        showUndecidedStatus: canChangeStatus === 2 || (status === 'rejected' && canChangeStatus === 1),
        showRejectedStatus: canChangeStatus === 2 || (status === 'undecided' && canChangeStatus === 1),
        showConfirmedStatus: canChangeStatus === 2 || (status === 'undecided' && canChangeStatus === 1)
      }));

      this.$id('reason').val(this.model.get('reason'));
      this.$id('aor').val(this.model.get('aor'));

      this.setUpReasonSelect2();
      this.setUpAorSelect2();
      this.updateCorroborateSubmit(null, canChangeStatus);
    },

    updateCorroborateSubmit: function(e, canChangeStatus)
    {
      if (canChangeStatus === undefined)
      {
        canChangeStatus = this.model.canChangeStatus(this.settings.getCanChangeStatusOptions());
      }

      var $status = this.$id('status');
      var status = buttonGroup.getValue($status);

      if (!status || status.length === 0)
      {
        status = null;
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

      var comment = status === null;
      var icon = status ? 'gavel' : 'comment';
      var label = '<i class="fa fa-' + icon + '"></i><span>'
        + t('prodDowntimes', 'corroborate:submit:' + status)
        + '</span>';

      this.$('button[type="submit"]')
        .removeClass('btn-primary btn-success btn-danger btn-warning')
        .addClass('btn-' + this.model.getCssClassName(status))
        .html(label);

      var reasonVisible = false;
      var aorVisible = false;
      var defaultAorVisible = false;

      if (canChangeStatus === 2)
      {
        reasonVisible = status !== null;
        aorVisible = status !== null;
      }
      else if (canChangeStatus === 1)
      {
        reasonVisible = status === 'undecided';
        aorVisible = status === 'undecided';
        defaultAorVisible = status === 'rejected';
      }

      this.$id('reason').closest('.form-group').toggleClass('hidden', !reasonVisible);
      this.$id('aor').closest('.form-group').toggleClass('hidden', !aorVisible);
      this.$id('defaultAor').toggleClass('hidden', !defaultAorVisible);

      this.$id('comment')
        .prop('required', comment)
        .closest('.form-group')
        .find('label')
        .toggleClass('is-required', comment);

      if (e)
      {
        if (reasonVisible)
        {
          this.$id('reason').select2('focus');
        }
        else
        {
          this.$id('comment').focus();
        }
      }
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
      if (!this.model.get('finishedAt'))
      {
        this.$('[data-prop="duration"]').text(this.model.getDurationString());
      }

      this.$('.prodDowntimes-history-time').each(function()
      {
        var tagData = time.toTagData(this.getAttribute('datetime'));

        this.textContent = tagData.daysAgo > 5 ? tagData.long : tagData.human;
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
      var $reason = this.$id('reason');
      var $aor = this.$id('aor');
      var $comment = this.$id('comment');
      var newStatus = buttonGroup.getValue(this.$id('status'));
      var newReason = !$reason.length || $reason.closest('.form-group').hasClass('hidden') ? null : $reason.val();
      var newAor = !$aor.length || $aor.closest('.form-group').hasClass('hidden') ? null : $aor.val();
      var comment = $comment.val().trim();
      var data = {};

      if (Array.isArray(newStatus) && newStatus.length)
      {
        newStatus = newStatus[0];
      }

      if (_.isString(newStatus))
      {
        if (newStatus !== this.model.get('status'))
        {
          data.status = newStatus;
        }

        if (newReason && newAor)
        {
          if (newReason !== this.model.get('reason'))
          {
            data.reason = newReason;
          }

          if (newAor !== this.model.get('aor'))
          {
            data.aor = newAor;
          }
        }
        else if (newStatus === 'rejected')
        {
          newAor = this.getDefaultAor();

          if (newAor && newAor.id !== this.model.get('aor'))
          {
            data.aor = newAor.id;
          }
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

        $comment[0].setCustomValidity(t('prodDowntimes', 'corroborate:noChanges'));

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

    getDefaultAor: function()
    {
      var subdivision = orgUnits.getByTypeAndId('subdivision', this.model.get('subdivision'));

      if (!subdivision)
      {
        return null;
      }

      return aors.get(subdivision.get('aor')) || null;
    },

    onModelChange: function()
    {
      this.updateProps();
      this.updateCorroborateExtra();
    }

  });
});
