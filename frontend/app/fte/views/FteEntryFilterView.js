define([
  'underscore',
  'moment',
  'js2form',
  'app/i18n',
  'app/user',
  'app/data/aors',
  'app/core/View',
  'app/fte/templates/filter',
  'i18n!app/nls/fte'
], function(
  _,
  moment,
  js2form,
  t,
  user,
  aors,
  View,
  filterTemplate
) {
  'use strict';

  return View.extend({

    template: filterTemplate,

    events: {
      'submit .filter-form': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('fteFilter');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        aors: aors.toJSON()
      };
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.$('#' + this.idPrefix + '-aor').select2({
        width: 'resolve',
        allowClear: true
      }).select2('readonly', user.data.prodFunction === 'leader');
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        aor: '',
        date: '',
        shift: 0,
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit)
      };

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        var property = term.args[0];

        switch (property)
        {
          case 'aor':
            formData.aor = term.args[1];

            if (!aors.get(formData.aor))
            {
              formData.aor = '';
            }
            break;

          case 'date':
            formData.date = moment(term.args[1]).format('YYYY-MM-DD');
            break;

          case 'shift':
            formData.shift = parseInt(term.args[1], 10);

            if (formData.shift < 0 || formData.shift > 3)
            {
              formData.shift = 0;
            }
            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var selector = [];
      var aor = this.$('#' + this.idPrefix + '-aor').val();
      var dateMoment = moment(this.$('#' + this.idPrefix + '-date').val());
      var shift = parseInt(this.$('input[name=shift]:checked').val(), 10);

      if (aor !== '')
      {
        selector.push({name: 'eq', args: ['aor', aor]});
      }

      if (dateMoment.isValid())
      {
        selector.push({name: 'eq', args: ['date', dateMoment.valueOf()]});
      }

      if (shift > 0)
      {
        selector.push({name: 'eq', args: ['shift', shift]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$('#' + this.idPrefix + '-limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    }

  });
});
