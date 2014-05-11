// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/core/views/ListView',
  './DowntimePickerView'
], function(
  t,
  time,
  viewport,
  aors,
  downtimeReasons,
  ListView,
  DowntimePickerView
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

      if (this.model.prodLine)
      {
        topics['prodDowntimes.corroborated.' + this.model.prodLine.id] = 'onCorroborated';
      }

      return topics;
    },

    events: {
      'click .warning': 'showEditDialog'
    },

    initialize: function()
    {
      this.collection = this.model.prodDowntimes;

      ListView.prototype.initialize.apply(this, arguments);

      this.listenTo(this.model.prodDowntimes, 'add', this.render);
      this.listenTo(this.model.prodDowntimes, 'change', this.render);
      this.listenTo(this.model.prodDowntimes, 'remove', this.render);
    },

    destroy: function()
    {
      this.$el.popover('destroy');
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
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
      return this.model.prodDowntimes.map(function(prodDowntime)
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
            return view.model.prodDowntimes.get(this.dataset.id).get('reasonComment');
          }
        })
        .on('shown.bs.popover', function(e)
        {
          view.$(e.target).data('bs.popover').$tip.addClass('production-downtimes-popover');
        });
    },

    onCorroborated: function(message)
    {
      var prodDowntime = this.model.prodDowntimes.get(message._id);

      if (prodDowntime)
      {
        prodDowntime.set(message);

        this.trigger('corroborated', message._id);
      }
    },

    showEditDialog: function(e)
    {
      var prodShift = this.model;
      var prodDowntime = prodShift.prodDowntimes.get(e.currentTarget.dataset.id);

      var downtimePickerView = new DowntimePickerView({
        model: {
          mode: 'edit',
          prodShift: prodShift,
          startedAt: new Date(prodDowntime.get('startedAt')),
          reason: prodDowntime.get('reason'),
          aor: prodDowntime.get('aor'),
          reasonComment: prodDowntime.get('reasonComment')
        }
      });

      this.listenTo(downtimePickerView, 'downtimePicked', function(downtimeInfo)
      {
        delete downtimeInfo.startedAt;

        prodShift.editDowntime(prodDowntime, downtimeInfo);

        viewport.closeDialog();
      });

      viewport.showDialog(downtimePickerView, t('production', 'downtimePicker:title:edit'));
    }

  });
});
