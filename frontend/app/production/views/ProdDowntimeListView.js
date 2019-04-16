// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    localTopics: {
      'downtimeReasons.synced': 'render',
      'aors.synced': 'render'
    },

    remoteTopics: function()
    {
      var topics = {};

      if (this.model.prodLine)
      {
        topics['prodDowntimes.corroborated.' + this.model.prodLine.id + '.*'] = 'onCorroborated';
      }

      return topics;
    },

    events: {
      'click .warning': function(e)
      {
        this.showEditDialog(e.currentTarget.dataset.id);
      }
    },

    initialize: function()
    {
      this.collection = this.model.prodDowntimes;

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
        {id: 'time', label: t('production', 'prodDowntime:time'), className: 'is-min'},
        {id: 'reason', label: t('production', 'prodDowntime:reason'), className: 'is-min'},
        {id: 'aor', label: t('production', 'prodDowntime:aor')}
      ];
    },

    serializeRows: function()
    {
      var prodShiftId = this.model.id;

      return this.model.prodDowntimes
        .filter(function(prodDowntime)
        {
          return prodDowntime.get('prodShift') === prodShiftId;
        })
        .map(function(prodDowntime)
        {
          var row = prodDowntime.toJSON();
          var aor = aors.get(row.aor);
          var reason = downtimeReasons.get(row.reason);

          row.className = prodDowntime.getCssClassName();
          row.time = time.format(row.startedAt, 'LTS');

          if (row.finishedAt)
          {
            row.time += '-' + time.format(row.finishedAt, 'LTS');
          }

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
      ListView.prototype.afterRender.call(this);

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
          view.$(e.target).data('bs.popover').tip().addClass('production-downtimes-popover');
        });
    },

    onCorroborated: function(message)
    {
      var prodDowntime = this.model.prodDowntimes.get(message._id);

      if (prodDowntime)
      {
        delete message.changes;

        prodDowntime.set(message);

        this.trigger('corroborated', message._id);
      }
    },

    showEditDialog: function(downtimeId)
    {
      var prodShift = this.model;
      var prodDowntime = prodShift.prodDowntimes.get(downtimeId);

      if (!prodDowntime)
      {
        return;
      }

      var downtimePickerView = new DowntimePickerView({
        embedded: this.options.embedded,
        vkb: this.options.vkb,
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
