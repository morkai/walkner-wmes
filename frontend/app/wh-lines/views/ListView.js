// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView',
  'app/wh-lines/templates/list',
  'app/wh-lines/templates/row'
], function(
  ListView,
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

    onUpdated: function(message)
    {
      var view = this;
      var refresh = false;

      (message.updated || []).forEach(function(data)
      {
        var line = view.collection.get(data._id);

        if (refresh || !line)
        {
          refresh = true;

          return;
        }

        line.set(data);

        view.$('.list-item[data-id="' + line.id + '"]').replaceWith(view.renderPartialHtml(rowTemplate, {
          row: line.serialize()
        }));
      });

      if (refresh)
      {
        view.refreshCollection();
      }
    },

    getTemplateData: function()
    {
      return {
        renderRow: this.renderPartialHtml.bind(this, rowTemplate)
      };
    }

  });
});
