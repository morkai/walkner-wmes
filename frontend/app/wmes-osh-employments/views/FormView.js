// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-employments/templates/form'
], function(
  time,
  viewport,
  FormView,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'change #-month': 'loadExisting'

    }, FormView.prototype.events),

    getTemplateData: function()
    {
      const workplaces = new Map();
      const divisions = new Set();
      let i = 0;

      (this.model.get('divisions') || []).forEach(d =>
      {
        if (!workplaces.has(d.workplace))
        {
          workplaces.set(d.workplace, {
            _id: d.workplace,
            label: dictionaries.getLabel('workplaces', d.workplace),
            divisions: []
          });
        }

        workplaces.get(d.workplace).divisions.push({
          i: i++,
          _id: d.division,
          label: dictionaries.getLabel('divisions', d.division),
          count: d.count
        });

        divisions.add(d.division);
      });

      dictionaries.divisions.forEach(division =>
      {
        if (divisions.has(division.id))
        {
          return;
        }

        const workplaceId = division.get('workplace');

        if (!workplaces.has(workplaceId))
        {
          workplaces.set(workplaceId, {
            _id: workplaceId,
            label: dictionaries.getLabel('workplaces', workplaceId),
            divisions: []
          });
        }

        workplaces.get(workplaceId).divisions.push({
          i: i++,
          _id: division.id,
          label: division.getLabel(),
          count: 0
        });
      });

      this.divisions = [];

      workplaces.forEach(workplace =>
      {
        workplace.divisions.sort((a, b) => a.label.localeCompare(
          b.label, undefined, {numeric: true, ignorePunctuation: true}
        ));

        workplace.divisions.forEach(division =>
        {
          this.divisions.push({
            workplace: workplace._id,
            division: division._id,
            count: division.count
          });
        });
      });

      return {
        workplaces: Array.from(workplaces.values()).sort((a, b) => a.label.localeCompare(
          b.label, undefined, {numeric: true, ignorePunctuation: true}
        ))
      };
    },

    serializeToForm: function()
    {
      return {
        month: this.options.editMode ? time.utc.format(this.id, 'YYYY-MM') : (this.month || ''),
        divisions: this.divisions
      };
    },

    serializeForm: function(formData)
    {
      if (!this.options.editMode)
      {
        formData._id = formData.month + '-01T00:00:00Z';
      }

      delete formData.month;

      return formData;
    },

    loadExisting: function()
    {
      const date = this.$id('month').val();

      if (!date)
      {
        return;
      }

      const moment = time.utc.getMoment(`${date}-01`, 'YYYY-MM-DD');

      if (!moment.isValid())
      {
        return;
      }

      viewport.msg.loading();

      const req = this.ajax({
        url: `/osh/employments?_id<=${moment.valueOf()}&sort(-_id)&limit(1)`
      });

      req.fail(() =>
      {
        viewport.msg.loadingFailed();
      });

      req.done(res =>
      {
        viewport.msg.loaded();

        const data = res.collection && res.collection[0] || {};

        if (data._id !== moment.toISOString())
        {
          data._id = undefined;
        }

        this.month = moment.format('YYYY-MM');

        this.model.set(data, {silent: true});
        this.render();
      });
    }

  });
});
