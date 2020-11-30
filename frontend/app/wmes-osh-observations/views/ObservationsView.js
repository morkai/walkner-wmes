// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport',
  'app/core/View',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-nearMisses/NearMiss',
  'app/wmes-osh-nearMisses/views/FormView',
  'app/wmes-osh-kaizens/Kaizen',
  'app/wmes-osh-kaizens/views/FormView',
  '../Observation',
  'app/wmes-osh-observations/templates/details/observations',
  'app/wmes-osh-observations/templates/details/resolutionPopover'
], function(
  _,
  viewport,
  View,
  dictionaries,
  NearMiss,
  NearMissFormView,
  Kaizen,
  KaizenFormView,
  Observation,
  template,
  resolutionPopoverTemplate
) {
  'use strict';

  return View.extend({

    template,

    events: {

      'click a[data-action="addResolution"]': function(e)
      {
        this.showAddResolutionDialog(this.$(e.target).closest('tr')[0].dataset.id);
      }

    },

    initialize: function()
    {
      View.prototype.initialize.apply(this, arguments);

      this.once('afterRender', () =>
      {
        const render = _.debounce(this.render, 1);

        this.listenTo(this.resolutions, 'reset change:status', render);
        this.listenTo(this.model, `change:${this.options.property}`, render);
        this.listenTo(this.model, 'seen', this.onSeen);
      });
    },

    getTemplateData: function()
    {
      const observer = this.model.getObserver();

      return {
        property: this.options.property,
        observations: this.serializeObservations(),
        unseen: observer.notify && (observer.changes.all || observer.changes[this.options.property])
      };
    },

    afterRender: function()
    {
      const view = this;

      view.$el.popover({
        container: document.body,
        selector: '.osh-observations-details-resolution[data-rid]',
        placement: 'left',
        trigger: 'hover',
        html: true,
        content: function()
        {
          const resolution = view.resolutions.get(this.dataset.rid);

          if (!resolution)
          {
            return;
          }

          return view.renderPartialHtml(resolutionPopoverTemplate, {
            resolution: resolution.serializePopover()
          });
        }
      });
    },

    serializeObservations: function()
    {
      return this.model.get(this.options.property).map(o =>
      {
        o = _.clone(o);
        o.resolution = _.clone(o.resolution);
        o.resolution.resolvable = Observation.isResolvableObservation(this.options.property, o);

        if (o.resolution._id)
        {
          const resolution = this.resolutions.get(o.resolution.rid);

          o.resolution.url = this.genResolutionUrl(o.resolution);
          o.resolution.icon = resolution && resolution.get('status') === 'finished' ? 'fa-thumbs-o-up' : null;
        }

        return o;
      });
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

    showAddResolutionDialog: function(observationId)
    {
      const observation = this.model.get(this.options.property).find(o => o._id === observationId);

      if (!observation)
      {
        return;
      }

      const relation = this.model.getRelation();
      const type = observation.easy ? 'kaizen' : 'nearMiss';
      let dialogView = null;

      if (type === 'kaizen')
      {
        dialogView = new KaizenFormView({
          relation: this.model,
          model: new Kaizen({
            subject: this.model.get('subject'),
            workplace: this.model.get('workplace'),
            department: this.model.get('department'),
            building: this.model.get('building'),
            location: this.model.get('location'),
            station: this.model.get('station'),
            problem: observation.what,
            reason: observation.why
          })
        });
      }
      else if (type === 'nearMiss')
      {
        dialogView = new NearMissFormView({
          relation: this.model,
          model: new NearMiss({
            subject: this.model.get('subject'),
            workplace: this.model.get('workplace'),
            department: this.model.get('department'),
            building: this.model.get('building'),
            location: this.model.get('location'),
            station: this.model.get('station'),
            problem: observation.what,
            reason: observation.why,
            eventDate: this.model.get('date')
          })
        });
      }
      else
      {
        return;
      }

      viewport.showDialog(dialogView, this.t(`FORM:resolution:title:${type}`));

      dialogView.handleSuccess = () =>
      {
        const newObservations = _.clone(this.model.get(this.options.property));
        const newObservationI = newObservations.findIndex(o => o._id === observationId);

        if (newObservationI === -1)
        {
          viewport.closeDialog();

          return;
        }

        const newObservation = _.clone(newObservations[newObservationI]);

        newObservation.resolution = dialogView.model.getRelation();
        newObservation.implementer = dialogView.model.get('creator');

        newObservations[newObservationI] = newObservation;

        viewport.closeDialog();
        viewport.msg.saving();

        const req = this.promised(this.model.save({[this.options.property]: newObservations}), {wait: true});

        req.fail(() => viewport.msg.savingFailed());
        req.done(() => viewport.msg.saved());
      };
    }

  });
});
