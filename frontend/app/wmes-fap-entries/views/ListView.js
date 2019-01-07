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

    serializeColumns: function()
    {
      var columns = [{id: 'rid', className: 'is-min is-number'}];

      if (!this.options.orderDetails)
      {
        columns.push(
          {id: 'orderNo', className: 'is-min', tdClassName: 'text-mono'},
          {id: 'nc12', className: 'is-min', tdClassName: 'text-mono'},
          {id: 'mrp', className: 'is-min'}
        );
      }

      columns.push(
        {id: 'category', className: 'is-min'},
        {id: 'createdAt', className: 'is-min'},
        {id: 'divisions', className: 'is-min'},
        {id: 'lines', className: 'is-min'},
        {id: 'problem', className: 'is-min'},
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
        var actions = [ListView.actions.viewDetails(model)];

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
        },
        template: function(template)
        {
          return $(template).addClass('fap-list-popover');
        }
      });
    },

    onModelUpdated: function(message)
    {
      if (Object.keys(message.change.data).length)
      {
        this.refreshCollection(message);
      }
    }

  });
});
