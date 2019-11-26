// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/util/formatResultWithDescription',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  '../dictionaries',
  '../KaizenOrder',
  'app/kaizenOrders/templates/form',
  'app/minutesForSafetyCards/templates/_formRidEditor'
], function(
  _,
  $,
  t,
  time,
  user,
  buttonGroup,
  idAndLabel,
  formatResultWithDescription,
  FormView,
  setUpUserSelect2,
  kaizenDictionaries,
  KaizenOrder,
  template,
  renderRidEditor
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

  function formatUserSelect2Text(user, name)
  {
    return name;
  }

  return FormView.extend({

    template: template,

    events: _.assign({

      'keydown [role="togglePanel"]': function(e)
      {
        if (window.KAIZEN_MULTI && e.keyCode === 13)
        {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.click();
        }
      },

      'click [role="togglePanel"]': function(e)
      {
        if (!window.KAIZEN_MULTI)
        {
          return;
        }

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

      'change [name="status"]': 'toggleRequiredToFinishFlags',

      'change [type="date"]': function(e)
      {
        var moment = time.getMoment(e.target.value, 'YYYY-MM-DD');
        var days = moment.isValid() ? moment.diff(new Date(), 'days') : 0;
        var daysAbs = Math.abs(days);
        var $group = this.$(e.target).closest('.form-group');
        var $help = $group.find('.help-block');

        if (daysAbs <= 7)
        {
          e.target.setCustomValidity('');
          $help.remove();

          return;
        }

        if (!user.isAllowedTo('KAIZEN:MANAGE') && daysAbs > 60)
        {
          e.target.setCustomValidity(t('kaizenOrders', 'FORM:ERROR:date', {days: 60}));
        }

        if (!$help.length)
        {
          $help = $('<p class="help-block"></p>');
        }

        $help.text(t('kaizenOrders', 'FORM:help:date:diff', {
          dir: days > 0 ? 'future' : 'past',
          days: daysAbs
        })).appendTo($group);
      },

      'change #-confirmer': function()
      {
        var confirmer = this.$id('confirmer').select2('data');

        this.$id('fm24-group').toggleClass('hidden', !confirmer || !/fm.?24/i.test(confirmer.text));
      },

      'change #-fm24-confirmation': function(e)
      {
        var $email = this.$id('fm24-email');

        $email.prop('disabled', !e.target.checked);

        if (e.target.checked)
        {
          if (!/@/.test($email.val()))
          {
            $email.val(user.data.email);
          }

          $email.select();
        }
      },

      'click #-relatedSuggestion-message > a': function()
      {
        sessionStorage.setItem(
          'KO_LAST',
          JSON.stringify(
            _.assign(
              this.model.toJSON(),
              this.getFormData()
            )
          )
        );
      },
      'click a[role=rid]': function(e)
      {
        this.showRidEditor('relatedSuggestion', e.currentTarget);

        return false;
      },

      'change #-stdReturn': function()
      {
        this.togglePreventiveMeasuresValidity();
      },

      'change #-relatedSuggestion-checkbox': function()
      {
        this.togglePreventiveMeasuresValidity();
      }

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

      return _.assign(FormView.prototype.serialize.call(this), {
        relatedSuggestion: this.model.supportsRelatedSuggestion(),
        multiType: !!window.KAIZEN_MULTI || this.model.isMulti(),
        multiOwner: this.isMultiOwner(),
        today: time.format(new Date(), 'YYYY-MM-DD'),
        statuses: kaizenDictionaries.statuses,
        types: kaizenDictionaries.types,
        attachments: attachments,
        backTo: this.serializeBackTo()
      });
    },

    serializeBackTo: function()
    {
      if (this.backTo !== undefined)
      {
        return this.backTo;
      }

      var type = 'behaviorObsCards';
      var data = JSON.parse(sessionStorage.getItem('BOC_LAST') || 'null');

      if (!data)
      {
        data = JSON.parse(sessionStorage.getItem('MFS_LAST') || 'null');

        if (!data)
        {
          cleanUp();

          return this.backTo = null;
        }

        type = 'minutesForSafetyCards';
      }

      cleanUp();

      return this.backTo = {
        submitLabel: this.t('FORM:backTo:' + type + ':' + (data._id ? 'edit' : 'add')),
        cancelLabel: this.t('FORM:backTo:' + type + ':cancel'),
        cancelUrl: '#' + type + (data._id ? ('/' + data._id + ';edit') : ';add')
      };

      function cleanUp()
      {
        sessionStorage.removeItem('BOC_LAST');
        sessionStorage.removeItem('MFS_LAST');
      }
    },

    isMultiOwner: function()
    {
      return this.options.editMode && this.model.hasMultipleOwners('nearMiss');
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

    handleSuccess: function()
    {
      var lastBoc = JSON.parse(sessionStorage.getItem('BOC_LAST') || 'null');
      var lastMfs = JSON.parse(sessionStorage.getItem('MFS_LAST') || 'null');
      var type = lastBoc ? 'behaviorObsCards' : lastMfs ? 'minutesForSafetyCards' : null;
      var data = lastBoc || lastMfs;

      if (!this.options.editMode && type)
      {
        this.broker.publish('router.navigate', {
          url: '/' + type
            + (data._id ? ('/' + data._id + ';edit') : ';add')
            + '?nearMiss=' + this.model.get('rid'),
          trigger: true
        });
      }
      else
      {
        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl() + '?'
          + (this.options.editMode ? '' : '&thank=you')
          + (!this.options.standalone ? '' : '&standalone=1'),
          trigger: true
        });
      }
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();
      var eventDate = formData.eventDate ? time.getMoment(formData.eventDate) : null;

      if (eventDate)
      {
        formData.eventDate = eventDate.format('YYYY-MM-DD');
        formData.eventTime = eventDate.format('H');
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

      formData.subscribers = '';

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
      formData.suggestionOwners = kaizenDictionaries.multiType ? serializeOwners('suggestion') : [];
      formData.kaizenOwners = kaizenDictionaries.multiType ? serializeOwners('kaizen') : [];
      formData.subscribers = this.$id('subscribers').select2('data').map(function(subscriber)
      {
        return {
          id: subscriber.id,
          label: subscriber.text
        };
      });

      KaizenOrder.DATE_PROPERTIES.forEach(function(property)
      {
        var dateMoment = time.getMoment(formData[property], 'YYYY-MM-DD');

        formData[property] = dateMoment.isValid() ? dateMoment.toISOString() : null;
      });

      var eventTimeMatches = (formData.eventTime || '').match(/([0-9]{1,2})[^0-9]*([0-9]{1,2})?/);
      var eventTime = '00:00';

      delete formData.eventTime;

      this.$('.select2-container + input').each(function()
      {
        if (!formData[this.name])
        {
          formData[this.name] = null;
        }
      });

      if (eventTimeMatches)
      {
        var hours = eventTimeMatches[1];
        var minutes = eventTimeMatches[2];

        eventTime = (hours.length === 1 ? '0' : '') + hours + ':';

        if (minutes)
        {
          eventTime += (minutes.length === 1 ? '0' : '') + minutes;
        }
        else
        {
          eventTime += '00';
        }
      }

      var eventDate = time.getMoment(formData.eventDate + ' ' + eventTime, 'YYYY-MM-DD HH:mm');

      if (!eventDate.isValid())
      {
        eventDate = time.getMoment(formData.eventDate, 'YYYY-MM-DD');
      }

      formData.eventDate = eventDate.isValid() ? eventDate.toISOString() : null;

      if (this.model.supportsRelatedSuggestion())
      {
        formData.stdReturn = !!formData.stdReturn;
        formData.relatedSuggestion = parseInt(formData.relatedSuggestion, 10) || null;
      }
      else
      {
        formData.stdReturn = null;
        formData.relatedSuggestion = null;
      }

      return formData;

      function serializeOwners(type)
      {
        var owners = view.$id(type + 'Owners').select2('data');

        if (!Array.isArray(owners))
        {
          owners = [owners];
        }

        return owners.map(function(owner)
        {
          return {
            id: owner.id,
            label: owner.text
          };
        }).filter(function(owner)
        {
          return !!owner.id;
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

      var formatResult = formatResultWithDescription.bind(null, 'text', 'description');

      this.$id('cause').select2({
        allowClear: true,
        placeholder: ' ',
        dropdownCssClass: 'is-bigdrop',
        data: kaizenDictionaries.causes.map(idLabelAndDescription),
        formatResult: formatResult
      });

      this.$id('nearMissCategory').select2({
        allowClear: true,
        placeholder: ' ',
        dropdownCssClass: 'is-bigdrop',
        data: kaizenDictionaries.categories.where({inNearMiss: true}).map(idLabelAndDescription),
        formatResult: formatResult
      });

      this.$id('suggestionCategory').select2({
        allowClear: true,
        placeholder: ' ',
        dropdownCssClass: 'is-bigdrop',
        data: kaizenDictionaries.categories.where({inSuggestion: true}).map(idLabelAndDescription),
        formatResult: formatResult
      });

      this.$id('risk').select2({
        allowClear: true,
        placeholder: ' ',
        dropdownCssClass: 'is-bigdrop',
        data: kaizenDictionaries.risks.map(idLabelAndDescription),
        formatResult: formatResult
      });

      buttonGroup.toggle(this.$id('status'));

      setUpUserSelect2(this.$id('subscribers'), {
        multiple: true,
        textFormatter: formatUserSelect2Text,
        activeOnly: !this.options.editMode
      });

      this.setUpConfirmerSelect2();
      this.setUpOwnerSelect2();
      this.toggleStatuses();
      this.toggleSubmit();
      this.toggleRequiredToFinishFlags();
      this.togglePanels();
      this.toggleRelatedSuggestion();

      this.$('input[autofocus]').focus();
    },

    setUpConfirmerSelect2: function()
    {
      var confirmer = this.model.get('confirmer');
      var $confirmer = setUpUserSelect2(this.$id('confirmer'), {
        textFormatter: formatUserSelect2Text,
        activeOnly: !this.options.editMode
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
      var isMultiOwner = this.isMultiOwner();
      var activeOnly = !isEditMode;
      var model = this.model;
      var currentUser = null;

      if (this.options.operator)
      {
        currentUser = this.options.operator;
      }
      else if (user.isLoggedIn())
      {
        currentUser = {
          id: user.data._id,
          text: user.getLabel()
        };
      }

      setUpUserSelect2(this.$id('nearMissOwners'), {
        multiple: isMultiOwner,
        textFormatter: formatUserSelect2Text,
        activeOnly: activeOnly
      }).select2('data', prepareOwners('nearMiss', isMultiOwner));

      setUpUserSelect2(this.$id('suggestionOwners'), {
        multiple: true,
        textFormatter: formatUserSelect2Text,
        activeOnly: activeOnly
      }).select2('data', prepareOwners('suggestion', true));

      setUpUserSelect2(this.$id('kaizenOwners'), {
        multiple: true,
        textFormatter: formatUserSelect2Text,
        activeOnly: activeOnly
      }).select2('data', prepareOwners('kaizen', true));

      function prepareOwners(type, multi)
      {
        if (!isEditMode)
        {
          if (!currentUser)
          {
            return null;
          }

          return multi ? [currentUser] : currentUser;
        }

        var owners = model.get(type + 'Owners');

        if (!Array.isArray(owners) || !owners.length)
        {
          return multi ? [] : null;
        }

        owners = owners.map(function(owner)
        {
          return {
            id: owner.id,
            text: owner.label
          };
        });

        return multi ? owners : owners.length ? owners[0] : null;
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
      this.toggleRequiredFlags();
      this.toggleChooseTypesMsg();

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
      this.toggleRequiredFlags();
      this.toggleChooseTypesMsg();

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
        if (this.dataset.required)
        {
          return view.handleRequiredToFinishFlags(this.dataset.required, required);
        }

        if (this.nextElementSibling.classList.contains('select2-container'))
        {
          this.parentNode.classList.toggle('has-required-select2', required);
        }

        if (!required)
        {
          view.$('#' + this.htmlFor).prop('required', false);
        }
      });

      this.$('.kaizenOrders-form-msg-optional').toggleClass('hidden', required);

      if (required)
      {
        this.toggleRequiredFlags();
      }
    },

    handleRequiredToFinishFlags: function(prop)
    {
      if (prop === 'preventiveMeasures')
      {
        this.togglePreventiveMeasuresValidity();
      }
    },

    togglePreventiveMeasuresValidity: function()
    {
      var $label = this.$('.control-label[data-required="preventiveMeasures"]');

      if (!$label.length)
      {
        return;
      }

      var required = $label.hasClass('is-required');
      var $stdReturn = this.$id('stdReturn');
      var $relatedSuggestion = this.$id('relatedSuggestion');

      if (required)
      {
        var $relatedSuggestionCheckbox = $relatedSuggestion.find('input[type="checkbox"]');
        var $relatedSuggestionValue = $relatedSuggestion.find('input[name="relatedSuggestion"]');

        $relatedSuggestionCheckbox.prop('checked', !!$relatedSuggestionValue.val());
        $stdReturn.prop('required', !$relatedSuggestionCheckbox.prop('checked'));
      }
      else
      {
        $stdReturn.prop('required', false);
        $relatedSuggestion.prop('required', false);
      }
    },

    toggleRequiredFlags: function()
    {
      var view = this;

      view.$('.kaizenOrders-form-typePanel').each(function()
      {
        var $panel = $(this);
        var required = $panel.hasClass('is-expanded');

        $panel.find('.is-required').each(function()
        {
          if (this.dataset.required)
          {
            return view.handleRequiredToFinishFlags(this.dataset.required, required);
          }

          $panel.find('#' + this.htmlFor).prop('required', required);
        });
      });
    },

    toggleChooseTypesMsg: function()
    {
      this.$id('chooseTypes').toggleClass('hidden', this.$('.kaizenOrders-form-typePanel.is-expanded').length > 0);
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
        var isNotConfirmer = !this.model.isConfirmer();

        if (isNotConfirmer)
        {
          disabled.push('accepted', 'finished');
        }

        if ((!this.model.isCreator() || this.model.get('status') !== 'new') && isNotConfirmer)
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

    showRidEditor: function(ridProperty, aEl)
    {
      var view = this;
      var $a = view.$(aEl);

      if ($a.next('.popover').length)
      {
        $a.popover('destroy');

        return;
      }

      $a.popover({
        placement: 'auto top',
        html: true,
        trigger: 'manual',
        content: this.renderPartialHtml(renderRidEditor, {
          property: ridProperty,
          rid: this.model.get(ridProperty) || ''
        })
      }).popover('show');

      var $popover = $a.next('.popover');
      var $input = $popover.find('.form-control').select();
      var $submit = $popover.find('.btn-default');
      var $cancel = $popover.find('.btn-link');

      $cancel.on('click', function()
      {
        $a.popover('destroy');
      });

      $input.on('keydown', function(e)
      {
        if (e.keyCode === 13)
        {
          return false;
        }
      });

      $input.on('keyup', function(e)
      {
        if (e.keyCode === 13)
        {
          $submit.click();

          return false;
        }
      });

      $submit.on('click', function()
      {
        $input.prop('disabled', true);
        $submit.prop('disabled', true);
        $cancel.prop('disabled', true);

        var rid = parseInt($input.val(), 10) || 0;

        if (rid <= 0)
        {
          return updateRid(null);
        }

        var url = (/suggestion/i.test(ridProperty) ? '/suggestions' : '/kaizen/orders') + '/' + rid;
        var req = view.ajax({url: url});

        req.fail(function(jqXhr)
        {
          view.showErrorMessage(view.t(
            'FORM:ridEditor:' + (jqXhr.status === 404 ? 'notFound' : 'failure')
          ));

          $input.prop('disabled', false);
          $submit.prop('disabled', false);
          $cancel.prop('disabled', false);

          (jqXhr.status === 404 ? $input : $submit).focus();
        });

        req.done(function()
        {
          updateRid(rid);
        });

        return false;
      });

      function updateRid(newRid)
      {
        $a
          .popover('destroy')
          .parent()
          .html(view.t('FORM:' + ridProperty + ':' + (newRid ? 'edit' : 'add'), {
            rid: newRid
          }));

        view.model.attributes[ridProperty] = newRid;

        view.$('input[name=' + ridProperty + ']').val(newRid || '');

        if (ridProperty === 'relatedSuggestion')
        {
          view.toggleRelatedSuggestion();
          view.togglePreventiveMeasuresValidity();
        }
      }
    },

    toggleRelatedSuggestion: function()
    {
      var $relatedSuggestion = this.$id('relatedSuggestion');
      var rid = $relatedSuggestion.find('input[name="relatedSuggestion"]').val();

      $relatedSuggestion.find('input[type="checkbox"]').prop('checked', !!rid);
    }

  });
});
