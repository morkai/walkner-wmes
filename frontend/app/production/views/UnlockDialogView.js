// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/data/dictionaries',
  'app/data/orgUnits',
  'app/prodLines/ProdLineCollection',
  'app/production/templates/unlockDialog'
], function(
  _,
  t,
  viewport,
  View,
  dictionaries,
  orgUnits,
  ProdLineCollection,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'production-modal',

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        var submitEl = this.$id('submit')[0];

        if (submitEl.disabled)
        {
          return;
        }

        submitEl.disabled = true;

        var req = {
          prodLine: this.$id('prodLine').val(),
          station: +this.$id('station').val(),
          login: this.$id('login').val(),
          password: this.$id('password').val()
        };

        this.socket.emit('production.unlock', req, this.handleUnlockResponse.bind(this));
      }
    },

    getTemplateData: function()
    {
      return {
        type: 'unlock',
        prodLine: ''
      };
    },

    afterRender: function()
    {
      if (!this.model.get('prodLine'))
      {
        this.setUpProdLineSelect2();
      }
    },

    setUpProdLineSelect2: function()
    {
      var view = this;
      var prodLineCollection = new ProdLineCollection(null, {
        rqlQuery: 'deactivatedAt=null&sort(_id)'
      });

      prodLineCollection.once('reset', function()
      {
        var $prodLine = view.$id('prodLine');

        if (!$prodLine.length)
        {
          return;
        }

        $prodLine.parent().addClass('has-required-select2');
        $prodLine.removeClass('form-control').select2({
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
            var html = '<div class="production-select2">';
            html += '<p><strong>' + _.escape(result.id) + '</strong><br>';
            html += _.escape(result.description) + '</p>';
            html += '</div>';

            return html;
          }
        }).select2('focus');
      });

      this.promised(prodLineCollection.fetch({reset: true}));
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id('prodLine').select2('focus');
    },

    closeDialog: function() {},

    handleUnlockResponse: function(err, res)
    {
      if (err)
      {
        this.$id('password').val('');

        if (err.message === 'INVALID_PASSWORD')
        {
          this.$id('password').focus();
        }
        else
        {
          this.$id('login').val('').focus();
        }

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: this.t.has('unlockDialog:error:' + err.message)
            ? this.t('unlockDialog:error:' + err.message)
            : this.t('unlockDialog:error:UNLOCK_FAILURE')
        });

        return this.$id('submit').prop('disabled', false);
      }

      if (!this.model.get('prodLine'))
      {
        _.forEach(res.dictionaries, function(models, dictionaryName)
        {
          var dictionary = dictionaries[dictionaryName];

          if (dictionary)
          {
            dictionary.reset(models);
          }
        });
      }

      delete res.dictionaries;

      var remoteData = res.prodShift;

      if (remoteData)
      {
        remoteData.prodShiftOrder = res.prodShiftOrder;
        remoteData.prodDowntimes = res.prodDowntimes;
      }
      else
      {
        remoteData = {};
      }

      if (!this.model.get('prodLine'))
      {
        var prodLine = orgUnits.getByTypeAndId('prodLine', res.prodLine);

        if (prodLine === null)
        {
          return this.closeDialog();
        }

        remoteData = _.assign(remoteData, orgUnits.getAllForProdLine(prodLine));
      }

      remoteData.station = res.station >= 1 && res.station <= 7 ? res.station : 0;

      this.model.setSecretKey(res.secretKey, remoteData, true);
      this.closeDialog();
    }

  });
});
