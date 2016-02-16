// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  '../Suggestion',
  'app/suggestions/templates/form'
], function(
  _,
  $,
  t,
  time,
  user,
  buttonGroup,
  idAndLabel,
  FormView,
  setUpUserSelect2,
  kaizenDictionaries,
  Suggestion,
  template
) {
  'use strict';

  function idLabelAndDescription(model)
  {
    return {
      id: model.id,
      text: model.getLabel(),
      description: model.get('description')
    };
  }

  function formatResultWithDescription(result)
  {
    if (_.isEmpty(result.description))
    {
      return _.escape(result.text);
    }

    var html = '<div class="suggestions-select2">';
    html += '<h3>' + _.escape(result.text) + '</h3>';
    html += '<p>' + _.escape(result.description) + '</p>';
    html += '</div>';

    return html;
  }

  function formatUserSelect2Text(user, name)
  {
    return name;
  }

  return FormView.extend({

    template: template,

    events: _.extend({

      'keydown [role="togglePanel"]': function(e)
      {
        if (e.keyCode === 13)
        {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.click();
        }
      },

      'click [role="togglePanel"]': function(e)
      {
        var $panel = this.$(e.currentTarget).closest('.panel');
        var type = $panel.attr('data-type');

        if ($panel.hasClass('is-collapsed'))
        {
          this.expandPanel(type);
        }
        else
        {
          this.collapsePanel(type);
        }
      },

      'change [name="status"]': function()
      {
        this.togglePanels();
        this.toggleRequiredFlags();
      },

      'change [name="categories"]': function()
      {
        this.toggleProductFamily();
      },

      'change [name="productFamily"]': function()
      {
        this.updateProductFamilySubscribers();
      },

      'change [type="date"]': function(e)
      {
        var moment = time.getMoment(e.target.value, 'YYYY-MM-DD');
        var days = moment.isValid() ? moment.diff(new Date(), 'days') : 0;
        var daysAbs = Math.abs(days);
        var $group = this.$(e.target).closest('.form-group');
        var $help = $group.find('.help-block');

        if (daysAbs <= 7)
        {
          $help.remove();

          return;
        }

        if (!$help.length)
        {
          $help = $('<p class="help-block"></p>');
        }

        $help.text(t('suggestions', 'FORM:help:date:diff', {
          dir: days > 0 ? 'future' : 'past',
          days: daysAbs
        })).appendTo($group);
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.productFamilyObservers = {};
    },

    serialize: function()
    {
      var attachments = {};

      if (this.options.editMode)
      {
        this.model.get('attachments').forEach(function(attachment)
        {
          attachments[attachment.description] = attachment;
        });
      }

      return _.extend(FormView.prototype.serialize.call(this), {
        today: time.format(new Date(), 'YYYY-MM-DD'),
        statuses: kaizenDictionaries.statuses,
        attachments: attachments
      });
    },

    checkValidity: function()
    {
      return true;
    },

    submitRequest: function($submitEl, formData)
    {
      var view = this;
      var uploadFormData = new FormData();
      var files = 0;

      this.$('input[type="file"]').each(function()
      {
        if (this.files.length)
        {
          uploadFormData.append(this.dataset.name, this.files[0]);

          ++files;
        }
      });

      if (files === 0)
      {
        return FormView.prototype.submitRequest.call(view, $submitEl, formData);
      }

      this.$el.addClass('is-uploading');

      var uploadReq = this.ajax({
        type: 'POST',
        url: '/suggestions;upload',
        data: uploadFormData,
        processData: false,
        contentType: false
      });

      uploadReq.done(function(attachments)
      {
        formData.attachments = attachments;

        FormView.prototype.submitRequest.call(view, $submitEl, formData);
      });

      uploadReq.fail(function()
      {
        view.showErrorMessage(t('suggestions', 'FORM:ERROR:upload'));

        $submitEl.attr('disabled', false);
      });

      uploadReq.always(function()
      {
        view.$el.removeClass('is-uploading');
      });
    },

    handleSuccess: function()
    {
       this.broker.publish('router.navigate', {
        url: this.model.genClientUrl() + (this.options.editMode ? '' : '?thank=you'),
        trigger: true
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      Suggestion.DATE_PROPERTIES.forEach(function(property)
      {
        if (formData[property])
        {
          formData[property] = time.format(formData[property], 'YYYY-MM-DD');
        }
      });

      formData.categories = _.isEmpty(formData.categories) ? '' : formData.categories.join(',');
      formData.subscribers = '';

      return formData;
    },

    serializeForm: function(formData)
    {
      var confirmer = this.$id('confirmer').select2('data');

      formData.categories = formData.categories.split(',');
      formData.confirmer = !confirmer ? null : {
        id: confirmer.id,
        label: confirmer.text
      };
      formData.suggestionOwners = this.serializeOwners('suggestion');
      formData.kaizenOwners = this.serializeOwners('kaizen');
      formData.subscribers = this.$id('subscribers').select2('data').map(function(subscriber)
      {
        return {
          id: subscriber.id,
          label: subscriber.text
        };
      });

      Suggestion.DATE_PROPERTIES.forEach(function(property)
      {
        var dateMoment = time.getMoment(formData[property], 'YYYY-MM-DD');

        formData[property] = dateMoment.isValid() ? dateMoment.toISOString() : null;
      });

      delete formData.attachments;

      return formData;
    },

    serializeOwners: function(type)
    {
      return this.$id(type + 'Owners').select2('data')
        .map(function(owner)
        {
          return {
            id: owner.id,
            label: owner.text
          };
        })
        .filter(function(owner)
        {
          return !!owner.id;
        });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('section').select2({
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      this.$id('categories').select2({
        allowClear: true,
        placeholder: ' ',
        dropdownCssClass: 'is-bigdrop',
        multiple: true,
        data: kaizenDictionaries.categories.where({inSuggestion: true}).map(idLabelAndDescription),
        formatResult: formatResultWithDescription
      });

      this.$id('productFamily').select2({
        allowClear: true,
        placeholder: ' ',
        data: kaizenDictionaries.productFamilies.map(idAndLabel)
      });

      buttonGroup.toggle(this.$id('status'));

      setUpUserSelect2(this.$id('subscribers'), {
        multiple: true,
        textFormatter: formatUserSelect2Text
      });

      this.setUpConfirmerSelect2();
      this.setUpOwnerSelect2();
      this.toggleStatuses();
      this.togglePanels();
      this.toggleProductFamily();

      this.$('input[autofocus]').focus();
    },

    setUpConfirmerSelect2: function()
    {
      var confirmer = this.model.get('confirmer');
      var $confirmer = setUpUserSelect2(this.$id('confirmer'), {
        textFormatter: formatUserSelect2Text
      });

      if (confirmer)
      {
        $confirmer.select2('data', {
          id: confirmer.id,
          text: confirmer.label
        });
      }
    },

    setUpOwnerSelect2: function()
    {
      var isEditMode = this.options.editMode;
      var model = this.model;
      var currentUser = {
        id: user.data._id,
        text: user.getLabel(true)
      };

      setUpUserSelect2(this.$id('suggestionOwners'), {multiple: true, textFormatter: formatUserSelect2Text})
        .select2('data', prepareOwners('suggestion'));

      setUpUserSelect2(this.$id('kaizenOwners'), {multiple: true, textFormatter: formatUserSelect2Text}).
        select2('data', prepareOwners('kaizen'));

      function prepareOwners(type)
      {
        if (!isEditMode)
        {
          return currentUser;
        }

        var owners = model.get(type + 'Owners');

        if (!Array.isArray(owners) || !owners.length)
        {
          return [];
        }

        return owners.map(function(owner)
        {
          return {
            id: owner.id,
            text: owner.label
          };
        });
      }
    },

    toggleRequiredFlags: function()
    {
      this.$('.suggestions-form-typePanel').each(function()
      {
        var $panel = $(this);
        var required = !$panel.hasClass('hidden');

        $panel.find('.is-required').each(function()
        {
          $panel.find('#' + this.htmlFor).prop('required', required);
        });
      });
    },

    toggleStatuses: function()
    {
      if (this.options.editMode)
      {
        if (user.isAllowedTo('SUGGESTIONS:MANAGE'))
        {
          return;
        }

        var disabled = ['new'];

        if (!this.model.isConfirmer())
        {
          disabled.push('accepted', 'finished');
        }

        if ((!this.model.isCreator() || this.model.get('status') !== 'new') && !this.isConfirmer())
        {
          disabled.push('cancelled');
        }

        var viewEl = this.el;

        disabled.forEach(function(status)
        {
          var statusEl = viewEl.querySelector('input[name="status"][value="' + status + '"]');

          statusEl.parentNode.classList.toggle('disabled', !statusEl.checked);
        });

        this.$id('statusGroup').removeClass('hidden');
      }
      else
      {
        this.$id('statusGroup').toggleClass('hidden', !user.isAllowedTo('SUGGESTIONS:MANAGE'));
      }
    },

    togglePanels: function()
    {
      var status = buttonGroup.getValue(this.$id('status'));

      this.$id('panel-kaizen').toggleClass('hidden', status === 'new' || status === 'cancelled');
    },

    toggleProductFamily: function()
    {
      var isConstruction = _.includes(this.$id('categories').val().split(','), 'KON');
      var $input = this.$id('productFamily');
      var $group = $input.closest('.form-group');
      var $label = $group.find('.control-label');

      $input.prop('required', isConstruction).select2('enable', isConstruction);

      if (!isConstruction)
      {
        $input.select2('data', null);
        this.updateProductFamilySubscribers();
      }

      $label.toggleClass('is-required', isConstruction);
      $group.toggleClass('has-required-select2', isConstruction);
    },

    updateProductFamilySubscribers: function()
    {
      var view = this;
      var productFamily = kaizenDictionaries.productFamilies.get(this.$id('productFamily').val());
      var productFamilySubscribers = productFamily ? (productFamily.get('owners') || []) : [];
      var nonProductFamilySubscribers = {};
      var subscribers = [];

      this.$id('subscribers').select2('data').forEach(function(o)
      {
        if (!view.productFamilyObservers[o.id])
        {
          nonProductFamilySubscribers[o.id] = true;

          subscribers.push(o);
        }
      });

      view.productFamilyObservers = {};

      _.forEach(productFamilySubscribers, function(o)
      {
        if (!nonProductFamilySubscribers[o.id])
        {
          subscribers.push({
            id: o.id,
            text: o.label
          });

          view.productFamilyObservers[o.id] = true;
        }
      });

      this.$id('subscribers').select2('data', subscribers);
    }

  });
});
