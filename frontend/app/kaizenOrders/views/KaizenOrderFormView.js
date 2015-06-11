// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
  '../dictionaries',
  '../KaizenOrder',
  'app/kaizenOrders/templates/form'
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
  KaizenOrder,
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

    var html = '<div class="kaizenOrders-select2">';
    html += '<h3>' + _.escape(result.text) + '</h3>';
    html += '<p>' + _.escape(result.description) + '</p>';
    html += '</div>';

    return html;
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

      'change [name="status"]': 'toggleRequiredToFinishFlags'

    }, FormView.prototype.events),

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
        types: kaizenDictionaries.types,
        attachments: attachments
      });
    },

    checkValidity: function(formData)
    {
      if (formData.types.length === 1 && _.contains(formData.types, 'kaizen'))
      {
        return this.showErrorMessage(t('kaizenOrders', 'FORM:ERROR:onlyKaizen'));
      }

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
        url: '/kaizen/orders;upload',
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
        view.showErrorMessage(t('kaizenOrders', 'FORM:ERROR:upload'));

        $submitEl.attr('disabled', false);
      });

      uploadReq.always(function()
      {
        view.$el.removeClass('is-uploading');
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();
      var eventDate = formData.eventDate ? time.getMoment(formData.eventDate) : null;

      if (eventDate)
      {
        formData.eventDate = eventDate.format('YYYY-MM-DD');
        formData.eventTime = eventDate.format('HH:mm');
      }
      else
      {
        formData.eventDate = '';
        formData.eventTime = '';
      }

      KaizenOrder.DATE_PROPERTIES.forEach(function(property)
      {
        if (formData[property])
        {
          formData[property] = time.format(formData[property], 'YYYY-MM-DD');
        }
      });

      return formData;
    },

    serializeForm: function(formData)
    {
      var view = this;
      var confirmer = this.$id('confirmer').select2('data');

      delete formData.attachments;

      formData.confirmer = !confirmer ? null : {
        id: confirmer.id,
        label: confirmer.text
      };
      formData.types = _.values(kaizenDictionaries.types).filter(
        function(type) { return this.isPanelExpanded(type); },
        this
      );
      formData.nearMissOwners = serializeOwners('nearMiss');
      formData.suggestionOwners = serializeOwners('suggestion');
      formData.kaizenOwners = serializeOwners('kaizen');

      KaizenOrder.DATE_PROPERTIES.forEach(function(property)
      {
        var dateMoment = time.getMoment(formData[property], 'YYYY-MM-DD');

        formData[property] = dateMoment.isValid() ? dateMoment.toISOString() : null;
      });

      var eventTimeMatches = (formData.eventTime || '').match(/([0-9]{1,2}):([0-9]{1,2})/);
      var eventTime = '00:00';

      delete formData.eventTime;

      if (eventTimeMatches)
      {
        eventTime = (eventTimeMatches[1].length === 1 ? '0' : '') + eventTimeMatches[1]
          + ':' + (eventTimeMatches[2].length === 1 ? '0' : '') + eventTimeMatches[2];
      }

      var eventDate = time.getMoment(formData.eventDate + ' ' + eventTime, 'YYYY-MM-DD HH:mm');

      formData.eventDate = eventDate.isValid() ? eventDate.toISOString() : null;

      return formData;

      function serializeOwners(type)
      {
        var owners = view.$id(type + 'Owners').select2('data');

        return owners.map(function(owner)
        {
          return {
            id: owner.id,
            label: owner.text
          };
        });
      }
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('section').select2({
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      this.$id('area').select2({
        allowClear: true,
        placeholder: ' ',
        data: kaizenDictionaries.areas.map(idAndLabel)
      });

      this.$id('cause').select2({
        allowClear: true,
        placeholder: ' ',
        dropdownCssClass: 'is-bigdrop',
        data: kaizenDictionaries.causes.map(idLabelAndDescription),
        formatResult: formatResultWithDescription
      });

      this.$id('nearMissCategory').select2({
        allowClear: true,
        placeholder: ' ',
        dropdownCssClass: 'is-bigdrop',
        data: kaizenDictionaries.categories.where({inNearMiss: true}).map(idLabelAndDescription),
        formatResult: formatResultWithDescription
      });

      this.$id('suggestionCategory').select2({
        allowClear: true,
        placeholder: ' ',
        dropdownCssClass: 'is-bigdrop',
        data: kaizenDictionaries.categories.where({inSuggestion: true}).map(idLabelAndDescription),
        formatResult: formatResultWithDescription
      });

      this.$id('risk').select2({
        allowClear: true,
        placeholder: ' ',
        dropdownCssClass: 'is-bigdrop',
        data: kaizenDictionaries.risks.map(idLabelAndDescription),
        formatResult: formatResultWithDescription
      });

      buttonGroup.toggle(this.$id('status'));

      this.setUpConfirmerSelect2();
      this.setUpOwnerSelect2();
      this.toggleStatuses();
      this.toggleSubmit();
      this.toggleRequiredToFinishFlags();
      this.togglePanels();

      this.$('input[autofocus]').focus();
    },

    setUpConfirmerSelect2: function()
    {
      var confirmer = this.model.get('confirmer');
      var $confirmer = setUpUserSelect2(this.$id('confirmer'), {
        rqlQueryProvider: function(rql, term)
        {
          var rqlQuery = setUpUserSelect2.defaultRqlQueryProvider(rql, term);

          rqlQuery.selector.args.push({
            name: 'in',
            args: ['prodFunction', ['master', 'manager']]
          });

          return rqlQuery;
        }
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
        text: user.getLabel()
      };

      setUpUserSelect2(this.$id('nearMissOwners'), {multiple: true}).select2('data', prepareOwners('nearMiss'));
      setUpUserSelect2(this.$id('suggestionOwners'), {multiple: true}).select2('data', prepareOwners('suggestion'));
      setUpUserSelect2(this.$id('kaizenOwners'), {multiple: true}).select2('data', prepareOwners('kaizen'));

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

    isPanelExpanded: function(type)
    {
      return this.$id('panel-' + type).hasClass('is-expanded');
    },

    collapsePanel: function(type)
    {
      var $panel = this.$id('panel-' + type);

      $panel
        .removeClass('is-expanded ' + $panel.attr('data-expanded-class'))
        .addClass('panel-default is-collapsed');

      this.toggleSubmit();
      this.moveFields();
      this.toggleRequiredFlags();

      $panel.find('.panel-body').stop(false, false).slideUp('fast');

      return $panel;
    },

    expandPanel: function(type, animate)
    {
      var $panel = this.$id('panel-' + type);

      $panel
        .removeClass('is-collapsed panel-default')
        .addClass('is-expanded ' + $panel.attr('data-expanded-class'));

      this.toggleSubmit();
      this.moveFields();
      this.toggleRequiredFlags();

      var $panelBody = $panel.find('.panel-body').stop(false, false);

      if (animate === false)
      {
        $panelBody.css('display', 'block');
      }
      else
      {
        $panelBody.slideDown('fast', function()
        {
          $panel.find('input, textarea').first().focus();
        });
      }

      return $panel;
    },

    toggleRequiredToFinishFlags: function()
    {
      var selectedStatus = this.$('input[name="status"]:checked').val();
      var required = selectedStatus === 'finished';
      var view = this;

      this.$('.is-requiredToFinish').toggleClass('is-required', required).each(function()
      {
        if (this.nextElementSibling.classList.contains('select2-container'))
        {
          this.parentNode.classList.toggle('has-required-select2', required);
        }

        view.$('#' + this.htmlFor).prop('required', required);
      });

      this.$('.message-info').toggleClass('hidden', required);
    },

    toggleRequiredFlags: function()
    {
      console.log('toggleRequiredFlags');
      this.$('.kaizenOrders-form-typePanel').each(function()
      {
        var $panel = $(this);
        var required = $panel.hasClass('is-expanded');

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
        if (user.isAllowedTo('KAIZEN:MANAGE'))
        {
          return;
        }

        var disabled = ['new'];

        if (!this.model.isConfirmer())
        {
          disabled.push('accepted', 'finished');
        }

        if (!this.model.isCreator() || this.model.get('status') !== 'new')
        {
          disabled.push('cancelled');
        }

        var viewEl = this.el;

        disabled.forEach(function(status)
        {
          var statusEl = viewEl.querySelector('input[name="status"][value="' + status + '"]');

          statusEl.parentNode.classList.toggle('disabled', !statusEl.checked);
        });
      }
      else
      {
        this.$id('status').find('.btn').each(function()
        {
          this.classList.toggle('disabled', this.querySelector('input').value !== 'new');
        });
      }
    },

    toggleSubmit: function()
    {
      this.$id('submit').prop('disabled', this.$('.panel.is-expanded').length === 0);
    },

    togglePanels: function()
    {
      (this.model.get('types') || []).forEach(function(type) { this.expandPanel(type, false); }, this);
    },

    moveFields: function()
    {
      var isNearMiss = this.isPanelExpanded('nearMiss');
      var isSuggestion = this.isPanelExpanded('suggestion');
      var isKaizen = this.isPanelExpanded('kaizen');
      var $nearMissOwnersFormGroup = this.$id('nearMissOwnersFormGroup');
      var $suggestionOwnersFormGroup = this.$id('suggestionOwnersFormGroup');
      var $kaizenOwnersFormGroup = this.$id('kaizenOwnersFormGroup');
      var $eventDateAreaRow = this.$id('eventDateAreaRow');
      var $descriptionFormGroup = this.$id('descriptionFormGroup');
      var $nearMissOptional = this.$id('nearMissOptional');
      var $causeTextFormGroup = this.$id('causeTextFormGroup');
      var $causeCategoryRiskRow = this.$id('causeCategoryRiskRow');
      var $correctiveMeasuresFormGroup = this.$id('correctiveMeasuresFormGroup');
      var $suggestionCategoryFormGroup = this.$id('suggestionCategoryFormGroup');
      var $suggestionFormGroup = this.$id('suggestionFormGroup');
      var $suggestionPanelBody = this.$id('suggestionPanelBody');
      var $suggestionOptional = this.$id('suggestionOptional');
      var inNearMiss = $eventDateAreaRow.closest('.panel').attr('data-type') === 'nearMiss';

      if (isNearMiss)
      {
        if (inNearMiss)
        {
          if (!isSuggestion && isKaizen)
          {
            $suggestionFormGroup.insertAfter($kaizenOwnersFormGroup);
          }
          else
          {
            $suggestionFormGroup.insertAfter($suggestionOwnersFormGroup);
          }

          return;
        }

        $eventDateAreaRow.detach();
        $descriptionFormGroup.detach();
        $causeTextFormGroup.detach();
        $causeCategoryRiskRow.detach();
        $correctiveMeasuresFormGroup.detach();
        $suggestionFormGroup.detach();
        $suggestionCategoryFormGroup.detach();

        $suggestionCategoryFormGroup
          .removeClass('col-md-3')
          .appendTo($suggestionPanelBody);

        $suggestionFormGroup
          .removeClass('col-md-4')
          .insertAfter($suggestionOwnersFormGroup);

        $eventDateAreaRow
          .insertAfter($nearMissOwnersFormGroup);

        $descriptionFormGroup
          .insertAfter($eventDateAreaRow);

        $causeTextFormGroup
          .insertAfter($nearMissOptional);

        $causeCategoryRiskRow
          .insertAfter($causeTextFormGroup)
          .find('.col-md-3')
          .removeClass('col-md-3')
          .addClass('col-md-4');

        $correctiveMeasuresFormGroup
          .insertAfter($causeCategoryRiskRow);

        if (!isSuggestion && isKaizen)
        {
          $suggestionFormGroup.insertAfter($kaizenOwnersFormGroup);
        }
      }
      else if (isSuggestion)
      {
        if (!inNearMiss)
        {
          return;
        }

        $eventDateAreaRow.detach();
        $descriptionFormGroup.detach();
        $causeTextFormGroup.detach();
        $causeCategoryRiskRow.detach();
        $correctiveMeasuresFormGroup.detach();
        $suggestionFormGroup.detach();
        $suggestionCategoryFormGroup.detach();

        $eventDateAreaRow
          .insertAfter($suggestionOwnersFormGroup);

        $descriptionFormGroup
          .insertAfter($eventDateAreaRow);

        $suggestionFormGroup
          .insertAfter($descriptionFormGroup);

        $causeTextFormGroup
          .insertAfter($suggestionOptional);

        $causeCategoryRiskRow
          .insertAfter($causeTextFormGroup)
          .find('.col-md-4')
          .removeClass('col-md-4')
          .addClass('col-md-3');

        $suggestionCategoryFormGroup
          .addClass('col-md-3')
          .appendTo($causeCategoryRiskRow);

        $correctiveMeasuresFormGroup.insertAfter($causeCategoryRiskRow);
      }
    }

  });
});
