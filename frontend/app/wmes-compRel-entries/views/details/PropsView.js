// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/DetailsView',
  'app/planning/util/contextMenu',
  'app/wmes-compRel-entries/dictionaries',
  'app/wmes-compRel-entries/Entry',
  'app/wmes-compRel-entries/templates/details/props'
], function(
  viewport,
  DetailsView,
  contextMenu,
  dictionaries,
  Entry,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    remoteTopics: [],

    events: Object.assign({

      'click #-changeReason': function(e)
      {
        this.showChangeReasonMenu(e.pageY, e.pageX);
      }

    }, DetailsView.prototype.events),

    initialize: function()
    {
      DetailsView.prototype.initialize.apply(this, arguments);

      this.usedProps = [];
    },

    getTemplateData: function()
    {
      return {
        canChangeReason: Entry.can.changeReason(this.model)
      };
    },

    afterRender: function()
    {
      DetailsView.prototype.afterRender.apply(this, arguments);

      this.usedProps = this.$('.prop[data-prop]').map(function() { return this.dataset.prop; }).get().concat([
        'oldCode', 'oldName',
        'newCode', 'newName'
      ]);
    },

    onModelChanged: function(model)
    {
      if (this.usedProps.some(function(prop) { return typeof model.changed[prop] !== 'undefined'; }))
      {
        this.render();
      }
    },

    showChangeReasonMenu: function(top, left)
    {
      var view = this;
      var current = view.model.get('reason');
      var menu = [
        view.t('changeReason:header'),
        {
          label: dictionaries.reasons.getLabel(current),
          handler: view.changeReason.bind(view, current)
        }
      ];

      dictionaries.reasons.forEach(function(reason)
      {
        if (reason.id === current || !reason.get('active'))
        {
          return;
        }

        menu.push({
          label: reason.getLabel(),
          handler: view.changeReason.bind(view, reason.id)
        });
      });

      contextMenu.show(this, top, left, menu);
    },

    changeReason: function(newReason)
    {
      var view = this;

      if (view.model.get('reason') === newReason)
      {
        return;
      }

      viewport.msg.saving();

      var req = view.ajax({
        method: 'PUT',
        url: '/compRel/entries/' + view.model.id,
        data: JSON.stringify({
          reason: newReason
        })
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();
      });

      req.done(function()
      {
        viewport.msg.saved();

        view.model.set('reason', newReason);
      });
    }

  });
});
