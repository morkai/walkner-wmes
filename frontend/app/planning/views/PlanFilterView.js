// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/users/ownMrps',
  'app/planning/templates/planFilter'
], function(
  _,
  t,
  time,
  View,
  setUpMrpSelect2,
  ownMrps,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: _.assign({

      'input #-date': 'changeFilter',
      'change #-date': 'changeFilter',
      'change #-mrp': 'changeFilter'

    }, ownMrps.events),

    initialize: function()
    {
      this.listenTo(this.model, 'change:loading', this.onLoadingChanged);
      this.listenTo(this.model, 'change:minDate change:maxDate', this.onMinMaxDateChanged);
    },

    serialize: function()
    {
      return _.assign({
        idPrefix: this.idPrefix,
        showOwnMrps: ownMrps.hasAny(),
        minDate: this.model.get('minDate') || '2017-01-01',
        maxDate: this.model.get('maxDate') || time.utc.getMoment().startOf('day').add(2, 'days').format('YYYY-MM-DD')
      }, this.model.getFilter());
    },

    afterRender: function()
    {
      setUpMrpSelect2(this.$id('mrp'), {
        width: '600px',
        placeholder: t('planning', 'filter:mrp:placeholder'),
        sortable: true,
        view: this
      });
    },

    changeFilter: function()
    {
      var date = this.$id('date').val();
      var newFilter = {
        mrp: this.$id('mrp').val().split(',').filter(function(v) { return v.length > 0; })
      };

      if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date))
      {
        newFilter.date = date;
      }

      this.model.setFilter(newFilter);
    },

    onLoadingChanged: function()
    {
      var disabled = !!this.model.get('loading');

      this.$id('date').prop('disabled', disabled);
      this.$id('mrp').select2('enable', !disabled);
    },

    onMinMaxDateChanged: function()
    {
      this.$id('date').prop('min', this.model.get('minDate'));
      this.$id('date').prop('max', this.model.get('maxDate'));
    }

  });
});
