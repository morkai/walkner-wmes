// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  '../WhLineCollection',
  './RedirLineDialogView',
  'app/wh-lines/templates/list',
  'app/wh-lines/templates/row'
], function(
  user,
  viewport,
  ListView,
  WhLineCollection,
  RedirLineDialogView,
  listTemplate,
  rowTemplate
) {
  'use strict';

  return ListView.extend({

    template: listTemplate,

    localTopics: {
      'socket.connected': function() { this.refreshCollectionNow(); }
    },

    remoteTopics: function()
    {
      var topics = {};

      topics[this.collection.getTopicPrefix() + '.updated'] = 'onUpdated';

      return topics;
    },

    events: Object.assign({

      'click a[data-action="redirLine"]': function(e)
      {
        this.redirLine(this.$(e.currentTarget).closest('.list-item')[0].dataset.id);
      }

    }, ListView.prototype.events),

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.once('afterRender', function()
      {
        this.listenTo(this.collection, 'add change', this.renderRow);
      });
    },

    onUpdated: function(message)
    {
      var view = this;
      var refresh = false;

      (message.added || []).forEach(function(data)
      {
        var line = view.collection.get(data._id);

        if (line)
        {
          line.set(data);
        }
        else
        {
          view.collection.add(data);
        }
      });

      (message.updated || []).forEach(function(data)
      {
        var line = view.collection.get(data._id);

        if (refresh || !line)
        {
          refresh = true;

          return;
        }

        line.set(data);
      });

      if (refresh)
      {
        view.refreshCollection();
      }
    },

    getTemplateData: function()
    {
      return {
        renderRow: this.renderPartialHtml.bind(this, rowTemplate),
        canRedir: WhLineCollection.can.redir()
      };
    },

    renderRow: function(line)
    {
      var $row = this.$row(line.id);
      var html = this.renderPartialHtml(rowTemplate, {
        row: line.serialize(),
        canRedir: WhLineCollection.can.redir()
      });

      if ($row.length)
      {
        $row.replaceWith(html);
      }
      else
      {
        this.$('tbody').append(html);
      }
    },

    redirLine: function(sourceLineId)
    {
      var sourceLine = this.collection.get(sourceLineId);

      if (!sourceLine)
      {
        return;
      }

      if (viewport.currentDialog instanceof RedirLineDialogView
        && viewport.currentDialog.model.sourceLine.id === sourceLineId)
      {
        return;
      }

      var dialogView = new RedirLineDialogView({
        model: sourceLine
      });

      viewport.showDialog(
        dialogView,
        this.t('redirLine:title:' + (sourceLine.get('redirLine') ? 'stop' : 'start'))
      );
    }

  });
});
