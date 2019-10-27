// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/sapLaborTimeFixer/templates/tabs'
], function(
  _,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click #-workCenters a': function(e)
      {
        if (!e.currentTarget.classList.contains('active'))
        {
          this.model.selectWorkCenter(e.currentTarget.dataset.workCenter);
        }

        return false;
      },

      'click #-deps a': function(e)
      {
        var deps = e.currentTarget.dataset.deps;

        if (e.ctrlKey)
        {
          this.model.toggleDeps(deps);
        }
        else
        {
          this.model.selectDeps(deps);
        }

        return false;
      }

    },

    initialize: function()
    {
      this.listenTo(this.model, 'change:workCenter change:deps', this.render);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        workCenters: this.serializeWorkCenters(),
        deps: this.serializeDeps()
      };
    },

    serializeWorkCenters: function()
    {
      var selectedWorkCenter = this.model.getSelectedWorkCenter();

      return this.model.get('data').map(function(d)
      {
        return {
          _id: d._id,
          label: d.name,
          active: d === selectedWorkCenter ? 'active' : ''
        };
      });
    },

    serializeDeps: function()
    {
      var view = this;
      var deps = ['__ALL__', '__NULL__'].concat(view.model.getSelectedWorkCenter().deps);

      return deps.map(function(dep)
      {
        return {
          _id: dep,
          label: view.t.has('dep:' + dep) ? view.t('dep:' + dep) : dep,
          active: view.model.isDepSelected(dep) ? 'active' : ''
        };
      });
    }

  });
});
