// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/time',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/core/views/ListView'
], function(
  t,
  time,
  aors,
  downtimeReasons,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'production-downtimes',

    localTopics: {
      'downtimeReasons.synced': 'render',
      'aors.synced': 'render'
    },

    remoteTopics: function()
    {
      var topics = {};

      if (this.options.prodLine)
      {
        topics['prodDowntimes.corroborated.' + this.options.prodLine] = 'onCorroborated';
      }

      return topics;
    },

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.listenTo(this.collection, 'add', this.render);
      this.listenTo(this.collection, 'change', this.render);
      this.listenTo(this.collection, 'remove', this.render);
    },

    destroy: function()
    {
      this.$el.popover('destroy');
    },

    serializeColumns: function()
    {
      return [
        {id: 'startedAt', label: t('production', 'prodDowntime:startedAt')},
        {id: 'finishedAt', label: t('production', 'prodDowntime:finishedAt')},
        {id: 'reason', label: t('production', 'prodDowntime:reason')},
        {id: 'aor', label: t('production', 'prodDowntime:aor')}
      ];
    },

    serializeRows: function()
    {
      return this.collection.map(function(prodDowntime)
      {
        var row = prodDowntime.toJSON();
        var aor = aors.get(row.aor);
        var reason = downtimeReasons.get(row.reason);

        row.className = prodDowntime.getCssClassName();
        row.startedAt = time.format(row.startedAt, 'YYYY-MM-DD HH:mm:ss');
        row.finishedAt = row.finishedAt ? time.format(row.finishedAt, 'YYYY-MM-DD HH:mm:ss') : '-';

        if (aor)
        {
          row.aor = aor.get('name');
        }

        if (reason)
        {
          row.reason = reason.get('label');
        }

        if (row.reasonComment)
        {
          row.className += ' has-comment';
          row.reason += ' <i class="fa fa-info-circle"></i>';
        }

        return row;
      });
    },

    serializeActions: function()
    {
      return [];
    },

    afterRender: function()
    {
      var view = this;

      this.$el
        .popover({
          selector: '.has-comment',
          trigger: 'hover',
          placement: 'top',
          container: this.el.ownerDocument.body,
          content: function()
          {
            return view.collection.get(this.dataset.id).get('reasonComment');
          }
        })
        .on('shown.bs.popover', function(e)
        {
          view.$(e.target).data('bs.popover').$tip.addClass('production-downtimes-popover');
        });
    },

    onCorroborated: function(message)
    {
      var prodDowntime = this.collection.get(message._id);

      if (prodDowntime)
      {
        prodDowntime.set(message);

        this.trigger('corroborated', message._id);
      }
    }

  });
});
