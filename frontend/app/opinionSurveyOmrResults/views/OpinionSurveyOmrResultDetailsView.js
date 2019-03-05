// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/opinionSurveyOmrResults/templates/details'
], function(
  _,
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    events: {
      'click .nav-tabs a': function(e)
      {
        e.preventDefault();

        var tab = this.$(e.target).tab('show').parent().attr('data-tab');

        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl() + '?tab=' + tab,
          trigger: false,
          replace: true
        });
      }
    },

    serialize: function()
    {
      return _.assign(DetailsView.prototype.serialize.call(this), {
        circles: this.serializeCircles()
      });
    },

    serializeCircles: function()
    {
      var circles = [];

      _.forEach(this.model.get('omrOutput'), function(omrRegion)
      {
        if (omrRegion.type !== 'circles')
        {
          return;
        }

        _.forEach(omrRegion.circles, function(circle, i)
        {
          circles.push({
            top: omrRegion.top + circle.y - circle.r,
            left: omrRegion.left + circle.x - circle.r,
            width: circle.r * 2,
            height: circle.r * 2,
            marked: _.includes(omrRegion.marked, i)
          });
        });
      });

      return circles;
    },

    afterRender: function()
    {
      DetailsView.prototype.afterRender.call(this);

      this.activateTab(this.options.tab || 'omrPreview');
    },

    activateTab: function(tab)
    {
      this.$('.nav-tabs > li[data-tab="' + tab + '"] > a').tab('show');
    },

    onModelEdited: function(message)
    {
      var remoteModel = message.model;

      if (remoteModel && remoteModel._id === this.model.id)
      {
        delete remoteModel.survey;

        this.model.set(remoteModel);
      }
    }

  });
});
