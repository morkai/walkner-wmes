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
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/historyItem',
  'app/suggestions/templates/history'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  renderUserInfo,
  kaizenDictionaries,
  renderHistoryItem,
  template
) {
  'use strict';

  var COORD_SECTION_STATUS_ICONS = {
    pending: 'fa-question',
    rejected: 'fa-thumbs-down',
    accepted: 'fa-thumbs-up'
  };

  return View.extend({

    template: template,

    events: {

      'submit form': function()
      {
        var view = this;
        var $comment = view.$id('comment');
        var comment = $comment.val().trim();

        if (comment === '')
        {
          return false;
        }

        var $submit = view.$id('submit').prop('disabled', true);

        var req = view.ajax({
          type: 'PUT',
          url: '/suggestions/' + view.model.id,
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
            text: view.t('MSG:comment:failure')
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

      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:changes', this.updateHistory);
        this.listenTo(this.model, 'change:observer', this.updateUnseen);
      });
    },

    destroy: function()
    {
      this.$el.popover('destroy');
    },

    getTemplateData: function()
    {
      return {
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
        comment: this.t('history:added')
      }, 0));

      return items;
    },

    serializeItem: function(change, changeIndex)
    {
      var view = this;
      var comment;
      var changes;

      if (change.data && change.data.observer)
      {
        changes = [];
        comment = view.t('history:observer:' + change.data.observer[0]);
      }
      else
      {
        changes = _.map(change.data, function(values, property)
        {
          var label = view.t('PROPERTY:' + property);

          if (values[0] === null && values[1] && (values[1].added || values[1].edited || values[1].deleted))
          {
            return {
              label,
              values: view.serializeItemValues(property, values[1], changeIndex)
            };
          }

          return {
            label: label,
            oldValue: view.serializeItemValue(property, values[0], true, changeIndex),
            newValue: view.serializeItemValue(property, values[1], false, changeIndex)
          };
        });
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

    serializeItemValues: function(property, {added, edited, deleted}, changeIndex)
    {
      var view = this;
      var values = [];

      (deleted || []).forEach(function(value)
      {
        values.push({
          oldValue: view.serializeItemValue(property, value, true, changeIndex),
          newValue: '-'
        });
      });

      (added || []).forEach(function(value)
      {
        values.push({
          oldValue: '-',
          newValue: view.serializeItemValue(property, value, false, changeIndex)
        });
      });

      (edited || []).forEach(function(value)
      {
        values.push({
          oldValue: view.serializeItemValue(property, Object.assign({}, value, value.old), true, changeIndex),
          newValue: view.serializeItemValue(property, value, false, changeIndex)
        });
      });

      return values;
    },

    serializeItemValue: function(property, value, isOld, changeIndex)
    {
      if (typeof value === 'boolean')
      {
        return this.t('core', 'BOOL:' + value);
      }

      if (_.isEmpty(value))
      {
        return '-';
      }

      switch (property)
      {
        case 'date':
        case 'kaizenStartDate':
        case 'kaizenFinishDate':
          return time.format(value, 'L');

        case 'confirmer':
        case 'superior':
          return renderUserInfo({userInfo: value});

        case 'suggestionOwners':
        case 'kaizenOwners':
          return value.map(function(owner) { return (owner.label || '').replace(/\s*\(.*?\)/, ''); }).join(', ');

        case 'status':
          return this.t('status:' + value);

        case 'section':
        case 'category':
        case 'productFamily':
        {
          var model = kaizenDictionaries.forProperty(property).get(value);

          return model ? model.getLabel() : value;
        }

        case 'subject':
        case 'howItIs':
        case 'howItShouldBe':
        case 'suggestion':
        case 'kaizenImprovements':
        case 'kaizenEffect':
          return value.length <= 43 ? value : {
            more: value,
            toString: function() { return value.substr(0, 40) + '...'; }
          };

        case 'attachments':
        {
          const a = `<a href="${this.model.getAttachmentUrl(value)}&change=${changeIndex}" target="_blank">`;
          let kind = '';

          if (value.kind && this.t.has(`history:attachmentKind:${value.kind}`))
          {
            kind = ' (' + this.t(`history:attachmentKind:${value.kind}`) + ')';
          }

          if (value.name.length <= 43)
          {
            return `${a}${_.escape(value.name)}</a>${kind}`;
          }

          return {
            more: value.name,
            toString: () => `${a}${_.escape(value.name).substr(0, 40)}...</a>${kind}`
          };
        }

        case 'subscribers':
          return value.join('; ');

        case 'coordSections':
          return value.map(function(coordSection)
          {
            return '<i class="fa ' + COORD_SECTION_STATUS_ICONS[coordSection.status] + '"></i><span>'
              + _.escape(coordSection._id) + '</span>';
          }).join(' ');

        default:
          return value || '';
      }
    },

    afterRender: function()
    {
      this.lastChangeCount = this.model.get('changes').length;

      this.$el.popover({
        container: 'body',
        selector: '.has-more',
        placement: 'top',
        trigger: 'hover',
        template: this.$el.popover.Constructor.DEFAULTS.template.replace(
          'class="popover"',
          'class="popover suggestions-history-popover"'
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

      $(html).insertAfter(this.$('.suggestions-history-item').last()).addClass('highlight');

      this.lastChangeCount = changes.length;
    },

    updateUnseen: function()
    {
      var $unseen = this.$('.is-unseen');

      if (!$unseen.length)
      {
        return;
      }

      var lastUnseenAt = Date.parse($unseen.last().find('.suggestions-history-time').attr('datetime'));
      var lastSeenAt = this.model.get('observer').lastSeenAt;

      if (lastSeenAt && lastSeenAt.getTime() >= lastUnseenAt)
      {
        $unseen.removeClass('is-unseen');
      }
    },

    updateTimes: function()
    {
      this.$('.suggestions-history-time').each(function()
      {
        var tagData = time.toTagData(this.getAttribute('datetime'));

        this.textContent = tagData.daysAgo > 5 ? tagData.long : tagData.human;
      });
    }

  });
});
