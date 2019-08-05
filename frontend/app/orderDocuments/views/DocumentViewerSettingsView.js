// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'js2form',
  'form2js',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/prodLines/ProdLineCollection',
  'app/orderDocuments/templates/settings'
], function(
  _,
  $,
  js2form,
  form2js,
  t,
  viewport,
  View,
  ProdLineCollection,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function()
      {
        this.submitForm();

        return false;
      },
      'change #-prodLineId': function(e)
      {
        this.$id('prodLineName').val(this.prepareProdLineName(e.target.value));
      },
      'change #-prefixFilter': function(e)
      {
        var prefixFilters = {};

        e.target.value.split(/[^0-9]/).forEach(function(prefixFilter)
        {
          if (/^[0-9]+$/.test(prefixFilter))
          {
            prefixFilters[prefixFilter] = true;
          }
        });

        e.target.value = Object.keys(prefixFilters).sort().join(' ');
      }
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      this.setUpProdLineSelect2();
    },

    serializeFormData: function()
    {
      var model = this.model;
      var prodLine = model.get('prodLine');
      var formData = {
        prodLineId: prodLine._id,
        prodLineName: prodLine.name,
        station: model.get('station'),
        prefixFilterMode: model.get('prefixFilterMode'),
        prefixFilter: model.get('prefixFilter'),
        spigotCheck: model.get('spigotCheck')
      };

      if (!formData.prodLineId)
      {
        var dashPos = this.model.id.indexOf('-');

        if (dashPos !== -1)
        {
          formData.prodLineId = this.model.id.substring(dashPos + 1);
          formData.prodLineName = this.prepareProdLineName(formData.prodLineId);
        }
      }

      return formData;
    },

    submitForm: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);

      $submit.find('.fa').removeClass('fa-save').addClass('fa-spin fa-spinner');

      var reqData = _.defaults(form2js(view.el), {
        prefixFilterMode: 'inclusive',
        prefixFilter: '',
        spigotCheck: false
      });

      reqData.station = parseInt(reqData.station, 10) || 0;

      var req = view.ajax({
        type: 'POST',
        url: window.location.href,
        data: JSON.stringify(reqData)
      });

      req.fail(function(res)
      {
        var code = ((res.responseJSON || {}).error || {}).message;
        var text = t.has('orderDocuments', 'settings:error:' + code)
          ? view.t('settings:error:' + code)
          : view.t('settings:error:failure');

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: text
        });
      });

      req.done(function()
      {
        view.trigger('settings', {
          prodLine: {
            _id: reqData.prodLineId,
            name: reqData.prodLineName
          },
          station: reqData.station,
          prefixFilterMode: reqData.prefixFilterMode,
          prefixFilter: reqData.prefixFilter,
          spigotCheck: reqData.spigotCheck
        });
      });

      req.always(function()
      {
        $submit
          .prop('disabled', false)
          .find('.fa')
          .removeClass('fa-spin fa-spinner')
          .addClass('fa-save');
      });
    },

    setUpProdLineSelect2: function()
    {
      var view = this;
      var prodLineCollection = new ProdLineCollection(null, {
        rqlQuery: 'deactivatedAt=null&sort(_id)'
      });

      prodLineCollection.once('reset', function()
      {
        var $prodLineId = view.$id('prodLineId');

        if (!$prodLineId.length)
        {
          return;
        }

        $prodLineId.parent().addClass('has-required-select2');
        $prodLineId.removeClass('form-control').select2({
          data: prodLineCollection.map(function(prodLine)
          {
            return {
              id: prodLine.id,
              text: prodLine.id,
              description: prodLine.get('description')
            };
          }),
          matcher: function(term, text, option)
          {
            term = term.toUpperCase();

            return text.toUpperCase().indexOf(term) !== -1 || option.description.toUpperCase().indexOf(term) !== -1;
          },
          formatResult: function(result)
          {
            var html = '<div class="kaizenOrders-select2">';
            html += '<p><strong>' + _.escape(result.id) + '</strong><br>';
            html += _.escape(result.description) + '</p>';
            html += '</div>';

            return html;
          }
        });
      });

      this.promised(prodLineCollection.fetch({reset: true}));
    },

    prepareProdLineName: function(prodLineId)
    {
      return prodLineId
        .replace(/_/g, ' ')
        .replace(/\s+/, ' ')
        .replace(/~.*?$/, '')
        .trim();
    },

    onDialogShown: function()
    {
      this.$id('prodLineId').focus();
    }

  });
});
