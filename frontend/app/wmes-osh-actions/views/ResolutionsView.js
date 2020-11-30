// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport',
  'app/core/View',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-kaizens/Kaizen',
  'app/wmes-osh-kaizens/views/FormView',
  '../Action',
  './FormView',
  'app/wmes-osh-actions/templates/details/resolutions'
], function(
  _,
  viewport,
  View,
  dictionaries,
  Kaizen,
  KaizenFormView,
  Action,
  ActionFormView,
  template
) {
  'use strict';

  return View.extend({

    template,

    events: {

      'click a[data-action="addResolution"]': function(e)
      {
        this.showAddResolutionDialog(e.currentTarget.dataset.type);
      }

    },

    initialize: function()
    {
      View.prototype.initialize.apply(this, arguments);

      this.once('afterRender', () =>
      {
        const render = _.debounce(this.render, 1);

        this.listenTo(this.resolutions, 'reset change', render);
        this.listenTo(this.model, `change:resolutions`, render);
        this.listenTo(this.model, 'seen', this.onSeen);
      });
    },

    getTemplateData: function()
    {
      const observer = this.model.getObserver();

      return {
        resolutions: this.serializeResolutions(),
        unseen: observer.notify && (observer.changes.all || observer.changes.resolutions)
      };
    },

    serializeResolutions: function()
    {
      return (this.model.get('resolutions') || [])
        .filter(r => !!this.resolutions.get(r.rid))
        .map(r => this.resolutions.get(r.rid).serializeRow());
    },

    genResolutionUrl: function(resolution)
    {
      const Entry = dictionaries.TYPE_TO_MODEL[resolution.type];
      const entry = new Entry({
        _id: resolution._id,
        rid: resolution.rid
      });

      return entry.genClientUrl();
    },

    onSeen: function()
    {
      this.$('.osh-unseen').removeClass('osh-unseen');
    },

    showAddResolutionDialog: function(type)
    {
      let dialogView = null;

      if (type === 'kaizen')
      {
        dialogView = new KaizenFormView({
          relation: this.model,
          model: new Kaizen({
            workplace: this.model.get('workplace'),
            department: this.model.get('department'),
            building: this.model.get('building'),
            location: this.model.get('location'),
            station: this.model.get('station')
          })
        });
      }
      else if (type === 'action')
      {
        dialogView = new ActionFormView({
          relation: this.model,
          model: new Action({
            workplace: this.model.get('workplace'),
            department: this.model.get('department'),
            building: this.model.get('building'),
            location: this.model.get('location'),
            station: this.model.get('station')
          })
        });
      }
      else
      {
        return;
      }

      viewport.showDialog(dialogView, this.t(`resolutions:title:${type}`));

      dialogView.handleSuccess = () =>
      {
        const resolutions = _.clone(this.model.get('resolutions'));
        const relation = dialogView.model.getRelation();

        if (resolutions.some(r => r.rid === relation.rid))
        {
          viewport.closeDialog();

          return;
        }

        resolutions.push(relation);

        viewport.closeDialog();
        viewport.msg.saving();

        const req = this.promised(this.model.save({resolutions}), {wait: true});

        req.fail(() => viewport.msg.savingFailed());
        req.done(() => viewport.msg.saved());
      };
    }

  });
});
