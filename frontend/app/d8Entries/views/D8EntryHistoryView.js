// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/d8Entries/dictionaries',
  'app/d8Entries/templates/strips',
  'app/d8Entries/templates/historyItem',
  'app/d8Entries/templates/history'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  renderUserInfo,
  dictionaries,
  renderStrips,
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
          url: '/d8/entries/' + this.model.id,
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
            text: t('d8Entries', 'MSG:comment:failure')
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

      this.listenTo(this.model, 'seen', function()
      {
        this.$el.find('.is-unseen').removeClass('is-unseen');
      });
    },

    destroy: function()
    {
      this.$el.popover('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        canEdit: this.model.canEdit(),
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
        comment: t('d8Entries', 'history:added')
      }, 0));

      return items;
    },

    serializeItem: function(change, changeIndex)
    {
      var comment;
      var changes;

      if (change.data && change.data.observer)
      {
        changes = [];
        comment = t('d8Entries', 'history:observer:' + change.data.observer[0]);
      }
      else
      {
        changes = _.map(change.data, function(values, property)
        {
          return {
            label: t('d8Entries', 'PROPERTY:' + property),
            oldValue: this.serializeItemValue(property, values[0], true, changeIndex),
            newValue: this.serializeItemValue(property, values[1], false, changeIndex)
          };
        }, this);
        comment = change.comment.trim();
      }

      var lastSeenAt = this.model.get('observer').lastSeenAt;

      return {
        seen: change.user.id === user.data._id
          || lastSeenAt === null
          || lastSeenAt.getTime() >= Date.parse(change.date),
        time: time.toTagData(change.date),
        user: renderUserInfo({userInfo: change.user}),
        changes: changes,
        comment: comment
      };
    },

    serializeItemValue: function(property, value, isOld, changeIndex)
    {
      if (value == null || value === '')
      {
        return '-';
      }

      if (/Date$/.test(property))
      {
        return time.format(value, 'LL');
      }

      switch (property)
      {
        case 'owner':
          return renderUserInfo({userInfo: value});

        case 'members':
          return value.map(function(member) { return (member.label || '').replace(/\s*\(.*?\)/, ''); }).join(', ');

        case 'status':
          return t('d8Entries', 'status:' + value);

        case 'division':
        case 'entrySource':
        case 'problemSource':
        {
          var model = dictionaries.forProperty(property).get(value);

          return model ? model.getLabel() : value;
        }

        case 'subject':
        case 'problemDescription':
          return value.length <= 43 ? value : {
            more: value,
            toString: function() { return value.substr(0, 40) + '...'; }
          };

        case 'strips':
          return renderStrips({
            strips: value,
            hover: false,
            changed: false
          });

        case 'attachment':
          return '<a href="/d8/entries/' + this.model.id + '/attachments/' + value._id
            + '?download=1&change=' + (isOld ? -changeIndex : changeIndex) + '">'
            + _.escape(value.name) + '</a>';

        case 'subscribers':
          return value.join('; ');

        case 'd5CloseDateOk':
          return '<i class="fa fa-thumbs-' + (value ? 'up' : 'down') + '"></i>';

        default:
          return value || '';
      }
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:changes', this.updateHistory);
      this.stopListening(this.model, 'change:observer', this.updateUnseen);
    },

    afterRender: function()
    {
      this.lastChangeCount = this.model.get('changes').length;

      this.listenTo(this.model, 'change:changes', this.updateHistory);
      this.listenTo(this.model, 'change:observer', this.updateUnseen);

      this.$el.popover({
        container: 'body',
        selector: '.has-more',
        placement: 'top',
        trigger: 'hover',
        template: this.$el.popover.Constructor.DEFAULTS.template.replace(
          'class="popover"',
          'class="popover d8Entries-history-popover"'
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

      $(html).insertAfter(this.$('.d8Entries-history-item').last()).addClass('highlight');

      this.lastChangeCount = changes.length;
    },

    updateUnseen: function()
    {
      var $unseen = this.$('.is-unseen');

      if (!$unseen.length)
      {
        return;
      }

      var lastUnseenAt = Date.parse($unseen.last().find('.d8Entries-history-time').attr('datetime'));
      var lastSeenAt = this.model.get('observer').lastSeenAt;

      if (lastSeenAt && lastSeenAt.getTime() >= lastUnseenAt)
      {
        $unseen.removeClass('is-unseen');
      }
    },

    updateTimes: function()
    {
      this.$('.d8Entries-history-time').each(function()
      {
        var tagData = time.toTagData(this.getAttribute('datetime'));

        this.textContent = tagData.daysAgo > 5 ? tagData.long : tagData.human;
      });
    }

  });
});
