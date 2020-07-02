// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/wh-lines/templates/filter'
], function(
  View,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click #-working > .btn': function(e)
      {
        var btnEl = e.currentTarget;

        if (btnEl.classList.contains('active'))
        {
          btnEl.classList.remove('active');
        }
        else
        {
          this.$id('working').find('.active').removeClass('active');
          btnEl.classList.add('active');
        }

        var working = this.$id('working').find('.active').val();

        this.model.setFilters({
          working: working === '1' ? true : working === '0' ? false : null
        });
      },

      'change #-mrps': function()
      {
        this.model.setFilters({
          mrps: this.$id('mrps').val().split(',').filter(function(v) { return !!v.length; })
        });
      }

    },

    initialize: function()
    {
      this.listenTo(this.model, 'filtered', this.updateUrl);
    },

    getTemplateData: function()
    {
      return {
        filters: this.model.getFilters()
      };
    },

    afterRender: function()
    {
      this.toggleWorking();

      setUpMrpSelect2(this.$id('mrps'), {
        view: this,
        own: true,
        width: '500px'
      });
    },

    toggleWorking: function()
    {
      var working = this.model.getFilters().working;

      this.$id('working-1').toggleClass('active', working === true);
      this.$id('working-0').toggleClass('active', working === false);
    },

    updateUrl: function()
    {
      var filters = this.model.getFilters();
      var query = [
        'working=' + (filters.working === false ? '0' : filters.working ? '1' : ''),
        'mrps=' + filters.mrps.map(function(mrp) { return encodeURIComponent(mrp); }).join(',')
      ];

      this.broker.publish('router.navigate', {
        replace: true,
        trigger: false,
        url: '/wh/lines?' + query.join('&')
      });
    }

  });
});
