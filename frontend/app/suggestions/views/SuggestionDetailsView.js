// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/details'
], function(
  _,
  DetailsView,
  kaizenDictionaries,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    afterRender: function()
    {
      var view = this;

      DetailsView.prototype.afterRender.call(view);

      view.$('.prop[data-dictionary]').each(function()
      {
        var descriptionHolder = kaizenDictionaries[this.dataset.dictionary].get(
          view.model.get(this.dataset.property)
        );

        if (!descriptionHolder)
        {
          return;
        }

        var description = descriptionHolder.get('description');

        if (!description)
        {
          return;
        }

        this.classList.toggle('has-description', true);
        this.dataset.description = description;
      });

      view.$el.popover({
        container: this.el,
        selector: '.has-description',
        className: 'suggestions-details-popover',
        trigger: 'hover',
        placement: function(popoverEl, propEl)
        {
          if (window.innerWidth <= 992)
          {
            return 'top';
          }

          var $column = view.$(propEl).closest('.panel').parent();

          if ($column[0] === $column.parent().children().last()[0])
          {
            return 'top';
          }

          return 'right';
        },
        content: function()
        {
          return this.dataset.description;
        }
      });
    },

    editModel: function(remoteModel)
    {
      var change = _.last(remoteModel.changes);
      var newData = remoteModel;

      if (change.data.resolutions)
      {
        newData = _.omit(newData, 'resolutions');

        this.reloadResolutions();
      }

      this.model.set(newData);
    },

    reloadResolutions: function()
    {
      var view = this;

      view.ajax({url: view.model.url() + '?select(resolutions)'}).done(function(res)
      {
        view.model.set(res);
      });
    }

  });
});
