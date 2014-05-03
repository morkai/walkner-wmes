// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/xiconf/templates/filter'
], function(
  _,
  js2form,
  t,
  time,
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
      this.idPrefix = _.uniqueId('xiconfResultFilter');

      if (this.collection)
      {
        this.listenTo(this.collection, 'change:srcIds', this.setUpSrcIdSelect2);
      }
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

      if (formData.result.length === 1)
      {
        this.$('.xiconf-filter-' + formData.result[0]).addClass('active');
      }
      else
      {
        this.$('.xiconf-filter-result > label').addClass('active');
      }

      this.setUpSrcIdSelect2();
    },

    setUpSrcIdSelect2: function()
    {
      this.$id('srcId').select2({
        width: '200px',
        allowClear: true,
        data: (this.collection.srcIds || []).map(function(srcId)
        {
          return {id: srcId, text: srcId};
        })
      });
    },

    serializeRqlQuery: function()
    {
      var datetimeFormat = this.$id('from').prop('type') === 'datetime-local'
        ? 'YYYY-MM-DDTHH:mm:ss'
        : 'YYYY-MM-DD HH:mm';
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        from: '',
        to: '',
        srcId: '',
        no: '',
        nc12: '',
        result: ['success', 'failure'],
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit)
      };

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        var property = term.args[0];

        switch (property)
        {
          case 'startedAt':
            formData[term.name === 'ge' ? 'from' : 'to'] =
              time.format(term.args[1], datetimeFormat);
            break;

          case 'orderNo':
          case 'nc12':
          case 'srcId':
            formData[property] = term.args[1];
            break;

          case 'result':
            if (term.args[1] === 'success' || term.args[1] === 'failure')
            {
              formData.result = [term.args[1]];
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
      var fromMoment = time.getMoment(this.$id('from').val());
      var toMoment = time.getMoment(this.$id('to').val());
      var no = this.$id('no').val().trim();
      var nc12 = this.$id('nc12').val().trim();
      var srcId = this.$id('srcId').val();
      var $result = this.$('input[name="result[]"]:checked');

      if (srcId.length)
      {
        selector.push({name: 'eq', args: ['srcId', srcId]});
      }

      if (/^[0-9]{9}$/.test(no))
      {
        selector.push({name: 'eq', args: ['orderNo', no]});
      }

      if (/^[0-9]{12}$/.test(nc12))
      {
        selector.push({name: 'eq', args: ['nc12', nc12]});
      }

      if (fromMoment.isValid())
      {
        selector.push({name: 'ge', args: ['startedAt', fromMoment.valueOf()]});
      }

      if (toMoment.isValid())
      {
        selector.push({name: 'lt', args: ['startedAt', toMoment.valueOf()]});
      }

      if ($result.length === 1)
      {
        selector.push({name: 'eq', args: ['result', $result.val()]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 20;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    }

  });
});
