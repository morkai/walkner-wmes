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

        var line = this.$id('list').find('.active').text().trim();
        var station = this.$('input[name="station"]:checked').val();

        if (!line || !station)
        {
          return;
        }

        var submitEl = this.$id('submit')[0];

        if (submitEl.disabled)
        {
          return;
        }

        submitEl.disabled = true;

        var req = {
          prodLine: line,
          station: +station,
          login: this.$id('login').val(),
          password: this.$id('password').val()
        };

        this.socket.emit('production.unlock', req, this.handleUnlockResponse.bind(this));
      },
      'click #-list .btn': function(e)
      {
        this.$id('list').find('.active').removeClass('active');
        this.$(e.currentTarget).addClass('active');
      },
      'click .btn': function()
      {
        if (this.options.vkb)
        {
          this.options.vkb.hide();
        }
      },
      'focus [data-vkb]': function(e)
      {
        if (this.options.embedded && this.options.vkb)
        {
          this.options.vkb.show(e.target);
        }
      }
    },

    destroy: function()
    {
      if (this.options.vkb)
      {
        this.options.vkb.hide();
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
      this.loadLines();

      this.$('input[name="station"][value="1"]').click();
    },

    selectActiveLine: function()
    {
      var $active = this.$id('list').find('.active');

      if ($active.length)
      {
        $active[0].scrollIntoView({block: 'center'});
      }
    },

    loadLines: function()
    {
      var view = this;

      view.$id('submit').prop('disabled', true);

      var req = view.ajax({url: '/production/getActiveLines?subdivisionType=assembly'});

      req.fail(function()
      {
        view.$('.fa-spin').removeClass('fa-spin');
      });

      req.done(function(res)
      {
        var html = '';

        _.forEach(res.collection, function(line)
        {
          html += '<button type="button" class="btn btn-lg btn-default">' + _.escape(line._id) + '</button>';
        });

        view.$id('list').html(html);
        view.$id('submit').prop('disabled', false);

        if (view.options.vkb)
        {
          view.options.vkb.reposition();
        }
      });
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
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
