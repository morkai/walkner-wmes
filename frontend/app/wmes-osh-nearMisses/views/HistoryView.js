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
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-nearMisses/templates/history/panel',
  'app/wmes-osh-nearMisses/templates/history/item'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  userInfoTemplate,
  dictionaries,
  template,
  itemTemplate
) {
  'use strict';

  const IGNORED_PROPS = {
    statusComment: true,
    statusUpdater: true,
    startedAt: true,
    finishedAt: true
  };

  return View.extend({

    template,

    events: {

      'click #-commentsOnly': function()
      {
        this.commentsOnly = !this.commentsOnly;

        if (this.commentsOnly)
        {
          localStorage.setItem('OSH_HISTORY_COMMENTS_ONLY', '1');
        }
        else
        {
          localStorage.removeItem('OSH_HISTORY_COMMENTS_ONLY');
        }

        this.render();
      },

      'submit form': function()
      {
        const $submit = this.$id('submit');
        const $comment = this.$id('comment');
        const comment = $comment.val().trim();

        if (!comment.replace(/[^a-zA-Z0-9]+/g, '').length)
        {
          $comment.val('').focus();

          return false;
        }

        $submit.prop('disabled', true);
        $comment.prop('disabled', true);

        const req = this.ajax({
          method: 'PUT',
          url: this.model.url(),
          data: JSON.stringify({
            comment
          })
        });

        req.fail(() => viewport.msg.savingFailed());

        req.done(() =>
        {
          viewport.msg.saved();

          $comment.val('');
        });

        req.always(() =>
        {
          $submit.prop('disabled', false);
          $comment.prop('disabled', false).focus();
        });

        return false;
      }

    },

    initialize: function()
    {
      this.commentsOnly = localStorage.getItem('OSH_HISTORY_COMMENTS_ONLY') === '1';

      this.once('afterRender', () =>
      {
        this.listenTo(this.model, 'change:changes', _.debounce(this.updateHistory, 1));
        this.listenTo(this.model, 'seen', this.onSeen);
      });
    },

    getTemplateData: function()
    {
      return {
        renderItem: this.renderPartialHtml.bind(this, itemTemplate),
        items: this.serializeItems(),
        canComment: this.model.constructor.can.comment(this.model),
        commentsOnly: this.commentsOnly
      };
    },

    serializeItems: function()
    {
      return this.model.get('changes')
        .map(this.serializeItem, this)
        .filter(this.filterItem, this);
    },

    filterItem: function(item)
    {
      if (this.commentsOnly && !item.comment)
      {
        return false;
      }

      return !!item.comment || !!item.changes.length;
    },

    serializeItem: function(change, changeIndex)
    {
      const observer = this.model.getObserver();
      const changedAt = Date.parse(change.date);
      const unseen = observer.notify && observer.lastSeenAt < changedAt;
      const changes = this.commentsOnly ? [] : _.map(change.data, (values, property) =>
      {
        if (IGNORED_PROPS[property])
        {
          return null;
        }

        const label = this.t(`PROPERTY:${property}`);

        if (values[0] === null && values[1] && (values[1].added || values[1].edited || values[1].deleted))
        {
          return {
            label,
            values: this.serializeItemValues(property, values[1], changeIndex)
          };
        }

        return {
          label,
          oldValue: this.serializeItemValue(property, values[0], true, changeIndex),
          newValue: this.serializeItemValue(property, values[1], false, changeIndex)
        };
      }).filter(change => !!change);

      return {
        i: changeIndex,
        time: time.toTagData(changedAt),
        user: userInfoTemplate(change.user, {noIp: true}),
        changes,
        comment: change.comment.trim(),
        unseen
      };
    },

    serializeItemValue: function(property, value)
    {
      if (value == null || value === '' || (Array.isArray(value) && value.length === 0))
      {
        return '-';
      }

      if (value === 0)
      {
        return 0;
      }

      if (typeof value === 'boolean')
      {
        return this.t('core', 'BOOL:' + value);
      }

      if (typeof value === 'string')
      {
        value = _.escape(value);
      }

      switch (property)
      {
        case 'implementer':
        case 'coordinators':
          return userInfoTemplate(value);

        case 'plannedAt':
          return time.utc.format(value, 'LL');

        case 'eventDate':
          return time.utc.format(value, this.t('details:eventDate:format'));

        case 'problem':
        case 'reason':
        case 'solution':
          return value.length <= 43 ? value : {
            more: value,
            toString: () => `${value.substr(0, 40)}...`
          };

        case 'priority':
        case 'status':
        case 'kind':
        case 'workplace':
        case 'division':
        case 'building':
        case 'location':
        case 'eventCategory':
        case 'reasonCategory':
        {
          const long = _.escape(dictionaries.getLabel(property, value, {long: true}));
          const short = _.escape(dictionaries.getLabel(property, value, {long: false}));

          if (long > 43)
          {
            if (short > 43)
            {
              return {
                more: long,
                toString: () => `${long.substr(0, 40)}...`
              };
            }

            return {
              more: long,
              toString: () => short
            };
          }

          return long;
        }

        case 'attachments':
        {
          const a = `<a href="${this.model.getAttachmentUrl(value)}" target="_blank">`;

          if (value.name.length <= 43)
          {
            return `${a}${_.escape(value.name)}</a>`;
          }

          return {
            more: value.name,
            toString: () => `${a}${_.escape(value.name).substr(0, 40)}...</a>`
          };
        }

        default:
          return value || '';
      }
    },

    serializeItemValues: function(property, {added, edited, deleted})
    {
      const values = [];

      (deleted || []).forEach(value => values.push({
        oldValue: this.serializeItemValue(property, value),
        newValue: '-'
      }));

      (added || []).forEach(value => values.push({
        oldValue: '-',
        newValue: this.serializeItemValue(property, value)
      }));

      (edited || []).forEach(value => values.push({
        oldValue: this.serializeItemValue(property, Object.assign({}, value, value.old)),
        newValue: this.serializeItemValue(property, value)
      }));

      return values;
    },

    afterRender: function()
    {
      this.lastChangeCount = this.model.get('changes').length;

      this.$el.popover({
        container: 'body',
        selector: '.has-more',
        placement: 'top',
        trigger: 'hover',
        className: 'osh-history-popover',
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
      const changes = this.model.get('changes');
      let html = '';

      for (let i = this.lastChangeCount; i < changes.length; ++i)
      {
        const item = this.serializeItem(changes[i], i);

        if (this.filterItem(item))
        {
          html += this.renderPartialHtml(itemTemplate, {
            item
          });
        }
      }

      if (html.length)
      {
        $(html).insertAfter(this.$('.osh-history-item').last()).addClass('highlight');
      }

      this.lastChangeCount = changes.length;
    },

    updateTimes: function()
    {
      this.$('.osh-history-time').each(function()
      {
        var tagData = time.toTagData(this.getAttribute('datetime'));

        this.textContent = tagData.daysAgo > 3 ? tagData.long : tagData.human;
      });
    },

    onSeen: function()
    {
      this.$('.osh-unseen').removeClass('osh-unseen');
    }

  });
});
