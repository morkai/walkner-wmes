// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'underscore',
  'js2form',
  'app/core/View',
  'app/reports/templates/2/displayOptions',
  'app/core/util/ExpandableSelect'
], function(
  $,
  _,
  js2form,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit form': function(e)
      {
        e.preventDefault();
      },
      'change #-series': function(e)
      {
        this.updateSelection('series', e.target);
      },
      'change [name=extremes]': function()
      {
        this.model.set('extremes', this.$('[name=extremes]:checked').val());
      },
      'click #-showFilter': function()
      {
        this.trigger('showFilter');
      }
    },

    destroy: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    beforeRender: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    afterRender: function()
    {
      js2form(this.el.querySelector('form'), this.serializeFormData());

      this.$('.is-expandable').expandableSelect();

      this.$('[name=extremes]:checked').closest('.btn').addClass('active');
    },

    serializeFormData: function()
    {
      return {
        series: Object.keys(this.model.get('series')),
        extremes: this.model.get('extremes')
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
    }

  });
});
