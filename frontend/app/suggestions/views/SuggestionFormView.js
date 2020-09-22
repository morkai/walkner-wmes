// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/core/templates/userInfo',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  '../Suggestion',
  'app/suggestions/templates/form',
  'app/suggestions/templates/formCoordSectionRow'
], function(
  _,
  $,
  t,
  time,
  user,
  buttonGroup,
  idAndLabel,
  FormView,
  userInfoTemplate,
  setUpUserSelect2,
  kaizenDictionaries,
  Suggestion,
  template,
  coordSectionRowTemplate
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

  return FormView.extend({

    template: template,

    events: _.assign({

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
        this.setUpCoordSectionSelect2();
      },

      'change [name="section"]': function()
      {
        this.setUpConfirmerSelect2();
        this.checkSectionValidity();
      },

      'change [name="categories"]': function()
      {
        this.toggleProductFamily();
      },

      'change [name="productFamily"]': function()
      {
        this.updateProductFamilySubscribers();

        if (this.$id('productFamily').val() === 'OTHER')
        {
          this.setUpProductFamily();
          this.$id('kaizenEvent').focus();
        }
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
          e.target.setCustomValidity('');
          $help.remove();

          return;
        }

        if (!user.isAllowedTo('SUGGESTIONS:MANAGE') && daysAbs > 60)
        {
          e.target.setCustomValidity(this.t('FORM:ERROR:date', {days: 60}));
        }

        if (!$help.length)
        {
          $help = $('<p class="help-block"></p>');
        }

        $help.text(this.t('FORM:help:date:diff', {
          dir: days > 0 ? 'future' : 'past',
          days: daysAbs
        })).appendTo($group);
      },

      'click #-productFamily-other': function()
      {
        var $productFamily = this.$id('productFamily');
        var $kaizenEvent = this.$id('kaizenEvent');
        var reset = $productFamily.val() === 'OTHER';

        $productFamily.select2('destroy').val(reset ? '' : 'OTHER');
        $kaizenEvent.val('');

        this.setUpProductFamily();

        if (reset)
        {
          $productFamily.select2('open');
        }
        else
        {
          $kaizenEvent.focus();
        }
      },

      'click #-confirmer-other': function()
      {
        this.otherConfirmer = !this.otherConfirmer;

        this.setUpConfirmerSelect2();

        this.$id('confirmer').select2('focus');
      },

      'change #-confirmer': 'checkOwnerValidity',
      'change #-suggestionOwners': 'checkOwnerValidity',
      'change #-kaizenOwners': 'checkOwnerValidity',

      'change #-coordSection': function(e)
      {
        if (e.added)
        {
          this.addCoordSection({_id: e.added.id});

          e.target.value = '';
        }

        this.setUpCoordSectionSelect2();
      },

      'change #-coordSections': function()
      {
        this.checkSectionValidity();
      },

      'click .btn[data-value="removeCoordSection"]': function(e)
      {
        this.$(e.currentTarget).closest('tr').remove();

        this.setUpCoordSectionSelect2();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.productFamilyObservers = {};
      this.otherConfirmer = false;

      this.listenTo(kaizenDictionaries.sections, 'add remove change', this.onSectionUpdated);
    },

    getTemplateData: function()
    {
      var attachments = {};

      if (this.options.editMode)
      {
        this.model.get('attachments').forEach(function(attachment)
        {
          attachments[attachment.description] = attachment;
        });
      }

      return {
        today: time.format(new Date(), 'YYYY-MM-DD'),
        statuses: kaizenDictionaries.kzStatuses,
        attachments: attachments,
        backTo: this.serializeBackTo()
      };
    },

    serializeBackTo: function()
    {
      if (this.backTo !== undefined)
      {
        return this.backTo;
      }

      var type;
      var data;
      var types = {
        KO_LAST: 'kaizenOrders',
        BOC_LAST: 'behaviorObsCards',
        MFS_LAST: 'minutesForSafetyCards'
      };

      _.forEach(types, function(v, k)
      {
        if (type)
        {
          return;
        }

        data = JSON.parse(sessionStorage.getItem(k) || 'null');

        if (data)
        {
          type = v;
        }
      });

      if (!type)
      {
        _.forEach(types, function(k) { sessionStorage.removeItem(k); });

        return this.backTo = null;
      }

      return this.backTo = {
        type: type,
        data: data,
        submitLabel: this.t('FORM:backTo:' + type + ':' + (data._id ? 'edit' : 'add')),
        cancelLabel: this.t('FORM:backTo:' + type + ':cancel'),
        cancelUrl: '#' + type + (data._id ? ('/' + data._id + ';edit') : ';add')
      };
    },

    checkValidity: function()
    {
      return true;
    },

    checkOwnerValidity: function()
    {
      var view = this;
      var $confirmer = view.$id('confirmer');
      var confirmer = $confirmer.select2('data');

      [view.$id('suggestionOwners'), view.$id('kaizenOwners')].forEach(function($owners)
      {
        if (!$owners.length)
        {
          return;
        }

        var owners = $owners.select2('data');
        var error = '';
        var data = {};

        if (confirmer && _.some(owners, function(owner) { return owner.id === confirmer.id; }))
        {
          error = 'FORM:ERROR:ownerConfirmer';
          data.prop = $owners[0].name;
        }

        if (!error && owners.length > 2)
        {
          error = 'FORM:ERROR:tooManyOwners';
          data.max = 2;
        }

        $owners[0].setCustomValidity(error ? view.t(error, data) : '');
      });
    },

    checkSectionValidity: function()
    {
      var $section = this.$id('section');
      var $coordSections = this.$id('coordSections');
      var sectionId = $section.val();
      var error = false;

      if (sectionId)
      {
        if (this.options.editMode)
        {
          error = $coordSections.find('tr[data-id="' + sectionId + '"]').length !== 0;
        }
        else
        {
          error = _.some($coordSections.select2('data'), function(d) { return d.id === sectionId; });
        }
      }

      $section[0].setCustomValidity(error ? this.t('FORM:ERROR:sectionCoord') : '');
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
      if (!this.options.editMode && this.backTo)
      {
        this.broker.publish('router.navigate', {
          url: '/' + this.backTo.type
            + (this.backTo.data._id ? ('/' + this.backTo.data._id + ';edit') : ';add')
            + '?suggestion=' + this.model.get('rid'),
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

      if (this.options.editMode)
      {
        var oldCoordSections = {};
        var newCoordSections = {};

        this.model.get('coordSections').forEach(function(coordSection)
        {
          oldCoordSections[coordSection._id] = coordSection;
        });

        this.$id('coordSections').find('tr').each(function()
        {
          var id = this.dataset.id;
          var section = kaizenDictionaries.sections.get(id);

          newCoordSections[id] = oldCoordSections[id] || {
            _id: id,
            name: section ? section.getLabel() : id,
            status: 'pending',
            user: null,
            time: null,
            comment: ''
          };
        });

        formData.coordSections = _.values(newCoordSections);
      }
      else
      {
        formData.coordSections = this.$id('coordSections').select2('data').map(function(item)
        {
          return {
            _id: item.id,
            name: item.text,
            status: 'pending',
            user: null,
            time: null,
            comment: ''
          };
        });
      }

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

      buttonGroup.toggle(this.$id('status'));

      setUpUserSelect2(this.$id('subscribers'), {
        multiple: true,
        noPersonnelId: true,
        activeOnly: !this.options.editMode
      });

      this.setUpSectionSelect2();
      this.setUpCategorySelect2();
      this.setUpProductFamily();
      this.setUpConfirmerSelect2();
      this.setUpOwnerSelect2();

      if (this.options.editMode)
      {
        this.renderCoordSections();
        this.setUpCoordSectionSelect2();
      }
      else
      {
        this.setUpCoordSectionsSelect2();
      }

      this.toggleStatuses();
      this.togglePanels();

      this.$('input[autofocus]').focus();
    },

    setUpSectionSelect2: function()
    {
      var id = this.model.get('section');
      var model = kaizenDictionaries.sections.get(id);
      var map = {};

      kaizenDictionaries.sections.forEach(function(s)
      {
        if (s.get('active') && s.get('confirmers').length)
        {
          map[s.id] = idAndLabel(s);
        }
      });

      if (id)
      {
        if (!model)
        {
          map[id] = {id: id, text: id};
        }
        else
        {
          map[id] = idAndLabel(model);
        }
      }

      this.$id('section').select2({
        data: _.values(map)
      });
    },

    setUpCategorySelect2: function()
    {
      var id = this.model.get('category');
      var model = kaizenDictionaries.categories.get(id);
      var map = {};

      kaizenDictionaries.categories.forEach(function(s)
      {
        if (s.get('active') && s.get('inSuggestion'))
        {
          map[s.id] = idLabelAndDescription(s);
        }
      });

      if (id)
      {
        if (!model)
        {
          map[id] = {id: id, text: id};
        }
        else
        {
          map[id] = idLabelAndDescription(model);
        }
      }


      this.$id('categories').select2({
        allowClear: true,
        placeholder: ' ',
        dropdownCssClass: 'is-bigdrop',
        multiple: true,
        data: _.values(map),
        formatResult: formatResultWithDescription
      });
    },

    setUpProductFamily: function()
    {
      var $productFamily = this.$id('productFamily');
      var $kaizenEvent = this.$id('kaizenEvent');
      var $other = this.$id('productFamily-other');

      if ($productFamily.val() === 'OTHER')
      {
        $other.text(this.t('FORM:productFamily:list'));
        $productFamily.select2('destroy').addClass('hidden');
        $kaizenEvent.removeClass('hidden');
      }
      else
      {
        var current = this.model.get('productFamily');

        $other.text(this.t('FORM:productFamily:other'));
        $kaizenEvent.addClass('hidden');
        $productFamily.removeClass('hidden').select2({
          allowClear: true,
          placeholder: ' ',
          data: kaizenDictionaries.productFamilies
            .filter(function(m) { return m.id === current || m.get('active'); })
            .map(idAndLabel)
        });
      }

      this.toggleProductFamily(true);
    },

    setUpConfirmerSelect2: function()
    {
      var section = kaizenDictionaries.sections.get(this.$id('section').val());
      var confirmersList = section ? section.get('confirmers') : [];
      var confirmersMap = {};
      var confirmer = this.model.get('confirmer');
      var $confirmer = this.$id('confirmer');
      var $other = this.$id('confirmer-other');

      confirmersList.forEach(function(u)
      {
        confirmersMap[u.id] = {
          id: u.id,
          text: u.label
        };
      });

      $confirmer.val('');

      if (!section)
      {
        $confirmer
          .select2('destroy')
          .addClass('form-control')
          .prop('disabled', true)
          .attr('placeholder', this.t('FORM:confirmer:section'));

        $other.addClass('hidden');

        return;
      }

      $confirmer
        .removeClass('form-control')
        .prop('disabled', false)
        .attr('placeholder', null);

      if (confirmersList.length && (user.isAllowedTo('SUGGESTIONS:MANAGE') || this.model.isConfirmer()))
      {
        $other
          .text(this.t('FORM:confirmer:' + (this.otherConfirmer ? 'list' : 'other')))
          .removeClass('hidden');
      }
      else
      {
        $other.addClass('hidden');
      }

      if (this.otherConfirmer || !confirmersList.length)
      {
        setUpUserSelect2($confirmer, {
          placeholder: this.t('FORM:confirmer:search'),
          noPersonnelId: true,
          activeOnly: !this.options.editMode
        });
      }
      else
      {
        if (confirmer)
        {
          confirmersMap[confirmer.id] = {
            id: confirmer.id,
            text: confirmer.label
          };
        }

        var coordinators = _.values(confirmersMap);

        coordinators.sort(function(a, b)
        {
          return a.text.localeCompare(b.text);
        });

        $confirmer.select2({
          width: '100%',
          allowClear: false,
          placeholder: this.t('FORM:confirmer:select'),
          data: coordinators
        });

        if (coordinators.length === 1)
        {
          confirmer = {
            id: coordinators[0].id,
            label: coordinators[0].text
          };
        }
      }

      $confirmer.select2('container').attr('title', '');

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

      setUpUserSelect2(this.$id('suggestionOwners'), {
        multiple: true,
        noPersonnelId: true,
        activeOnly: activeOnly
      }).select2('data', prepareOwners('suggestion'));

      setUpUserSelect2(this.$id('kaizenOwners'), {
        multiple: true,
        noPersonnelId: true,
        activeOnly: activeOnly
      }).select2('data', prepareOwners('kaizen'));

      function prepareOwners(type)
      {
        if (!isEditMode)
        {
          return currentUser ? [currentUser] : [];
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

    setUpCoordSectionsSelect2: function()
    {
      var $coordSection = this.$id('coordSections');

      var data = kaizenDictionaries.sections
        .filter(function(s)
        {
          return s.get('coordinators').length > 0;
        })
        .map(idAndLabel);

      $coordSection.select2({
        width: '100%',
        multiple: true,
        allowClear: true,
        placeholder: this.t('coordSections:add:placeholder'),
        data: data
      });
    },

    renderCoordSections: function()
    {
      this.$id('coordSections').html('');

      this.model.get('coordSections').forEach(this.addCoordSection, this);
    },

    setUpCoordSectionSelect2: function()
    {
      var $coordSections = this.$id('coordSections').find('tr');
      var $coordSection = this.$id('coordSection');

      var data = kaizenDictionaries.sections
        .filter(function(s)
        {
          return s.get('coordinators').length > 0
            && $coordSections.filter('tr[data-id="' + s.id + '"]').length === 0;
        })
        .map(idAndLabel);

      $coordSection.select2({
        width: '300px',
        placeholder: this.t('coordSections:edit:placeholder'),
        data: data
      });

      $coordSection.select2(data.length === 0 || !this.canManageCoordinators() ? 'disable' : 'enable');

      this.checkSectionValidity();
    },

    addCoordSection: function(coordSection)
    {
      if (!coordSection.status)
      {
        coordSection = _.find(this.model.get('coordSections'), function(s) { return s._id === coordSection._id; })
          || coordSection;
      }

      var section = kaizenDictionaries.sections.get(coordSection._id);

      var $row = this.renderPartial(coordSectionRowTemplate, {
        section: {
          _id: coordSection._id,
          name: section ? section.get('name') : coordSection.name,
          status: this.t('coordSections:status:' + (coordSection.status || 'pending')),
          user: coordSection.user ? userInfoTemplate({userInfo: coordSection.user}) : '',
          time: coordSection.time ? time.format(coordSection.time, 'L, LT') : '',
          comment: coordSection.comment || ''
        },
        canManage: this.canManageCoordinators()
      });

      this.$id('coordSections').append($row);
    },

    canManageCoordinators: function()
    {
      if (this.model.canManage())
      {
        return true;
      }

      var status = buttonGroup.getValue(this.$id('status'));

      if (status === 'accepted' && this.model.isConfirmer())
      {
        return true;
      }

      if (status === 'new'
        && (this.model.isConfirmer() || this.model.isCreator() || this.model.isSuggestionOwner()))
      {
        return true;
      }

      return false;
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
        if (this.model.canManage() || this.model.isConfirmer())
        {
          return;
        }

        var enabled = {};
        var status = this.model.get('status');
        var $status = this.$id('status');

        enabled[status] = true;

        if (status === 'new' && (this.model.isCreator() || this.model.isSuggestionOwner()))
        {
          enabled.cancelled = true;
        }

        $status.find('input').each(function()
        {
          this.parentNode.classList.toggle('disabled', !this.checked && !enabled[this.value]);
        });

        this.$id('statusGroup').removeClass('hidden');
      }
      else
      {
        this.$id('statusGroup').addClass('hidden');
      }
    },

    togglePanels: function()
    {
      var status = buttonGroup.getValue(this.$id('status'));

      this.$id('panel-kaizen').toggleClass('hidden', status === 'new' || status === 'cancelled');
    },

    toggleProductFamily: function(keepValue)
    {
      var isConstruction = _.includes(this.$id('categories').val().split(','), 'KON');
      var $input = this.$id('productFamily');
      var $group = $input.closest('.form-group');
      var $label = $group.find('.control-label');

      $input.prop('required', isConstruction);

      if (!isConstruction)
      {
        if (!keepValue)
        {
          $input.select2('data', null);
        }

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
    },

    onSectionUpdated: function()
    {
      this.setUpSectionSelect2();
      this.setUpConfirmerSelect2();

      if (this.options.editMode)
      {
        this.setUpCoordSectionSelect2();
      }
      else
      {
        this.setUpCoordSectionsSelect2();
      }
    }

  });
});
