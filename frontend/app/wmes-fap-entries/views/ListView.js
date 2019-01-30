// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/views/ListView'
], function(
  _,
  $,
  t,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: function()
    {
      var classes = ['fap-entries-list', 'is-clickable'];

      if (!this.options.orderDetails)
      {
        classes.push('is-colored');
      }

      return classes.join(' ');
    },

    remoteTopics: function()
    {
      var topics = {};
      var topicPrefix = this.collection.getTopicPrefix();

      if (topicPrefix)
      {
        topics[topicPrefix + '.added'] = 'refreshCollection';
        topics[topicPrefix + '.updated.*'] = 'onModelUpdated';
        topics[topicPrefix + '.deleted'] = 'onModelDeleted';
      }

      return topics;
    },

    localTopics: {
      'fap.entries.seen': function(message)
      {
        var view = this;
        var count = 0;

        message.seenEntries.forEach(function(entryId)
        {
          count += view.$('.fap-is-unseen[data-id="' + entryId + '"]').removeClass('fap-is-unseen').length;
        });

        if (count)
        {
          view.refreshCollection();
        }
      }
    },

    events: _.assign({

      'click .is-filter': function(e)
      {
        this.trigger('showFilter', e.currentTarget.dataset.columnId);
      },

      'click .action-seen': function(e)
      {
        var $action = this.$(e.currentTarget).addClass('disabled');
        var entry = this.collection.get($action.closest('tr')[0].dataset.id);

        if (entry)
        {
          entry.multiChange({});
        }
      }

    }, ListView.prototype.events),

    serializeColumns: function()
    {
      var filter = this.options.orderDetails ? '' : 'is-filter';
      var columns = [{id: 'rid', className: 'is-min is-number', thClassName: filter}];

      if (!this.options.orderDetails)
      {
        columns.push(
          {id: 'orderNo', className: 'is-min', tdClassName: 'text-mono', thClassName: filter},
          {id: 'nc12', className: 'is-min', tdClassName: 'text-mono', thClassName: filter},
          {id: 'productName', className: 'is-min', thClassName: filter},
          {id: 'mrp', className: 'is-min', thClassName: filter}
        );
      }

      columns.push(
        {id: 'category', className: 'is-min', thClassName: filter},
        {id: 'createdAt', className: 'is-min', thClassName: filter},
        {id: 'divisions', className: 'is-min', thClassName: filter},
        {id: 'lines', className: 'is-min'},
        {id: 'problem', className: 'is-min', thClassName: filter},
        '-'
      );

      return columns;
    },

    serializeActions: function()
    {
      var view = this;
      var collection = view.collection;

      return this.options.orderDetails ? null : function(row)
      {
        var model = collection.get(row._id);
        var actions = [];

        actions.push({
          id: 'seen',
          icon: 'eye',
          label: view.t('markAsSeen:listAction'),
          className: row.observer.changes.any ? '' : 'disabled'
        });

        actions.push(ListView.actions.viewDetails(model));

        if (model.canDelete())
        {
          actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.apply(this, arguments);

      this.$('tbody').popover({
        container: this.el,
        placement: 'auto left',
        selector: 'td[data-id]',
        trigger: 'hover',
        html: true,
        content: function()
        {
          if (this.dataset.id === 'category'
            && this.firstElementChild.clientWidth >= 275)
          {
            return this.textContent.trim();
          }

          if (this.dataset.id === 'problem'
            && this.firstElementChild.clientWidth >= 400)
          {
            return this.textContent.trim();
          }

          if (this.dataset.id === 'lines'
            && this.firstElementChild.clientWidth >= 250)
          {
            return this.textContent.trim();
          }
        },
        template: function(template)
        {
          return $(template).addClass('fap-list-popover');
        }
      });
    },

    onModelUpdated: function(message)
    {
      if (message.change.comment || Object.keys(message.change.data).length)
      {
        this.refreshCollection(message);
      }
    }

  });
});
