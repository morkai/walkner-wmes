// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/pfepEntries/PfepEntry',
  'app/pfepEntries/templates/historyItem',
  'app/pfepEntries/templates/history'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  renderUserInfo,
  PfepEntry,
  renderHistoryItem,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'submit form': function()
      {
        var $comment = this.$id('comment');
        var comment = $comment.val().trim();

        if (comment === '')
        {
          return false;
        }

        var $submit = this.$id('submit').prop('disabled', true);

        var req = this.ajax({
          type: 'PUT',
          url: '/pfep/entries/' + this.model.id,
          data: JSON.stringify({comment: comment})
        });

        req.done(function()
        {
          $comment.val('');
        });

        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('pfepEntries', 'MSG:comment:failure')
          });
        });

        req.always(function()
        {
          $submit.prop('disabled', false);
        });

        return false;
      }

    },

    initialize: function()
    {
      this.lastChangeCount = 0;
    },

    destroy: function()
    {
      this.$el.popover('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        canEdit: user.isAllowedTo('PFEP:MANAGE'),
        editUrl: this.model.genClientUrl('edit'),
        items: this.serializeItems()
      };
    },

    serializeItems: function()
    {
      var items = this.model.get('changes').map(this.serializeItem, this);

      items.unshift(this.serializeItem({
        user: this.model.get('creator'),
        date: this.model.get('createdAt'),
        data: {},
        comment: t('pfepEntries', 'history:added')
      }, 0));

      return items;
    },

    serializeItem: function(change, changeIndex)
    {
      return {
        seen: true,
        time: time.toTagData(change.date),
        user: renderUserInfo({userInfo: change.user}),
        changes: _.map(change.data, function(values, property)
        {
          return {
            label: t('pfepEntries', 'PROPERTY:' + property),
            oldValue: this.serializeItemValue(property, values[0], true, changeIndex),
            newValue: this.serializeItemValue(property, values[1], false, changeIndex)
          };
        }, this),
        comment: change.comment.trim()
      };
    },

    serializeItemValue: function(property, value, isOld)
    {
      if (typeof value === 'number')
      {
        return value.toLocaleString();
      }

      if (_.isEmpty(value))
      {
        return '-';
      }

      switch (property)
      {
        case 'notes':
          return value.length <= 43 ? value : {
            more: value,
            toString: function() { return value.substr(0, 40) + '...'; }
          };

        default:
          return value || '';
      }
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:changes', this.updateHistory);
    },

    afterRender: function()
    {
      this.lastChangeCount = this.model.get('changes').length;

      this.listenTo(this.model, 'change:changes', this.updateHistory);

      this.$el.popover({
        container: 'body',
        selector: '.has-more',
        placement: 'top',
        trigger: 'hover',
        template: this.$el.popover.Constructor.DEFAULTS.template.replace(
          'class="popover"',
          'class="popover pfepEntries-history-popover"'
        ),
        title: function()
        {
          return $(this).closest('tr').children().first().text();
        }
      });

      if (!this.timers.updateTimes)
      {
        this.timers.updateTimes = setInterval(this.updateTimes.bind(this), 30000);
      }
    },

    updateHistory: function()
    {
      var changes = this.model.get('changes');
      var html = '';

      for (var i = this.lastChangeCount; i < changes.length; ++i)
      {
        html += renderHistoryItem({item: this.serializeItem(changes[i], i)});
      }

      $(html).insertAfter(this.$('.pfepEntries-history-item').last()).addClass('highlight');

      this.lastChangeCount = changes.length;
    },

    updateTimes: function()
    {
      this.$('.pfepEntries-history-time').each(function()
      {
        var tagData = time.toTagData(this.getAttribute('datetime'));

        this.textContent = tagData.daysAgo > 5 ? tagData.long : tagData.human;
      });
    }

  });
});
