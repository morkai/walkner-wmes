// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore',
  'js2form',
  'app/core/View',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/reports/templates/1/displayOptions',
  'app/core/util/ExpandableSelect'
], function(
  $,
  _,
  js2form,
  View,
  aors,
  downtimeReasons,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function(e)
      {
        e.preventDefault();
      },
      'change #-series': function(e)
      {
        this.updateSelection('series', e.target);
      },
      'change #-references': function(e)
      {
        this.updateSelection('references', e.target, true);
      },
      'change #-aors': function(e)
      {
        this.updateSelection('aors', e.target);
      },
      'change #-reasons': function(e)
      {
        this.updateSelection('reasons', e.target);
      },
      'change [name=extremes]': function()
      {
        this.model.set('extremes', this.$('[name=extremes]:checked').val());
      },
      'click #-showFilter': function()
      {
        this.trigger('showFilter');
      },
      'click #-skipEmpty': function()
      {
        this.model.set('skipEmpty', !this.model.get('skipEmpty'));
      }
    },

    initialize: function()
    {
      this.listenTo(this.model, 'change:skipEmpty', this.toggleSkipEmpty);
    },

    destroy: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    getTemplateData: function()
    {
      return {
        aors: aors.map(function(aor)
        {
          return {
            id: aor.id,
            label: aor.getLabel()
          };
        }),
        reasons: downtimeReasons.map(function(reason)
        {
          return {
            id: reason.id,
            label: reason.id + ': ' + reason.getLabel()
          };
        })
      };
    },

    beforeRender: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      this.$('.is-expandable').expandableSelect();

      this.$('[name=extremes]:checked').closest('.btn').addClass('active');

      this.toggleSkipEmpty();
    },

    serializeFormData: function()
    {
      return {
        series: Object.keys(this.model.get('series')),
        extremes: this.model.get('extremes'),
        references: Object.keys(this.model.get('references')),
        aors: Object.keys(this.model.get('aors')),
        reasons: Object.keys(this.model.get('reasons'))
      };
    },

    updateSelection: function(property, selectEl, allowEmpty)
    {
      var selection = {};
      var i;
      var l;

      if (selectEl.selectedOptions.length === 0 && allowEmpty !== true)
      {
        for (i = 0, l = selectEl.length; i < l; ++i)
        {
          selectEl[i].selected = true;
        }
      }

      for (i = 0, l = selectEl.length; i < l; ++i)
      {
        selection[selectEl[i].value] = selectEl[i].selected;
      }

      this.model.set(property, selection);
    },

    shown: function()
    {
      this.$id('series').focus();
    },

    toggleSkipEmpty: function()
    {
      this.$id('skipEmpty').toggleClass('active', this.model.get('skipEmpty'));
    }

  });
});
