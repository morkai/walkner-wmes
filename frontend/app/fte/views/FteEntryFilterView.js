define([
  'underscore',
  'moment',
  'js2form',
  'app/i18n',
  'app/user',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/views/OrgUnitDropdownsView',
  'app/core/Model',
  'app/core/View',
  'app/fte/templates/filter',
  'i18n!app/nls/fte'
], function(
  _,
  moment,
  js2form,
  t,
  user,
  divisions,
  subdivisions,
  OrgUnitDropdownsView,
  Model,
  View,
  filterTemplate
) {
  'use strict';

  var ORG_UNIT = OrgUnitDropdownsView.ORG_UNIT;

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

      this.orgUnitDropdownsView = new OrgUnitDropdownsView({
        orgUnit: this.options.divisionOnly ? ORG_UNIT.DIVISION : ORG_UNIT.SUBDIVISION,
        allowClear: true,
        noGrid: true
      });

      this.setView('.orgUnitDropdowns-container', this.orgUnitDropdownsView);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.listenToOnce(this.orgUnitDropdownsView, 'afterRender', function()
      {
        /*jshint -W015*/

        var model = null;
        var orgUnit = null;

        if (formData.subdivision !== '')
        {
          orgUnit = ORG_UNIT.SUBDIVISION;
          model = new Model({subdivision: formData.subdivision});
        }
        else if (formData.division !== '')
        {
          orgUnit = ORG_UNIT.DIVISION;
          model = new Model({division: formData.division});
        }

        this.orgUnitDropdownsView.selectValue(model, orgUnit);
      });
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        division: '',
        subdivision: '',
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
          case 'division':
          case 'subdivision':
            formData[property] = term.args[1];

            if (!(property === 'division' ? divisions : subdivisions).get(formData[property]))
            {
              formData[property] = '';
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
      var division = this.orgUnitDropdownsView.$id('division').val();
      var subdivision = this.orgUnitDropdownsView.$id('subdivision').val();
      var dateMoment = moment(this.$id('date').val());
      var shift = parseInt(this.$('input[name=shift]:checked').val(), 10);

      if (!_.isEmpty(subdivision))
      {
        selector.push({name: 'eq', args: ['subdivision', subdivision]});
      }
      else if (!_.isEmpty(division))
      {
        selector.push({name: 'eq', args: ['division', division]});
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
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    }

  });
});
