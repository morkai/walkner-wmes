// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/util/resultTips',
  'app/core/views/FormView',
  'app/core/templates/userInfo',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  '../Suggestion',
  'app/suggestions/templates/form',
  'app/suggestions/templates/formCoordSectionRow',
  'app/suggestions/templates/formResolutionRow',
  'app/suggestions/templates/formAddOwner'
], function(
  _,
  $,
  t,
  time,
  currentUser,
  viewport,
  buttonGroup,
  idAndLabel,
  resultTips,
  FormView,
  userInfoTemplate,
  setUpUserSelect2,
  kaizenDictionaries,
  Suggestion,
  template,
  coordSectionRowTemplate,
  resolutionRowTemplate,
  addOwnerTemplate
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
        this.toggleRequiredToFinishFlags();
        this.setUpCoordSectionSelect2();
      },

      'change [name="section"]': function()
      {
        this.setUpConfirmerSelect2();
      },

      'change [name="categories"]': function()
      {
        this.toggleProductFamily();
        this.toggleResolutions();
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

        e.target.setCustomValidity('');

        if (daysAbs <= 7)
        {
          $help.remove();

          return;
        }

        if (!currentUser.isAllowedTo('SUGGESTIONS:MANAGE') && daysAbs > 60)
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

      'change #-confirmer': function()
      {
        this.checkOwnerValidity();
      },

      'change #-coordSection': function(e)
      {
        if (e.added)
        {
          this.addCoordSection({_id: e.added.id});

          e.target.value = '';
        }

        this.setUpCoordSectionSelect2();
      },

      'click .btn[data-value="removeCoordSection"]': function(e)
      {
        this.$(e.currentTarget).closest('tr').remove();

        this.setUpCoordSectionSelect2();
      },

      'change input[type="file"]': function()
      {
        var max = null;
        var limit = 10;
        var total = 0;

        this.$('input[type="file"]').each(function()
        {
          this.setCustomValidity('');

          total += this.files.length;

          if (!max || max.length < this.files.length)
          {
            max = this;
          }
        });

        if (total > limit)
        {
          max.setCustomValidity(this.t('FORM:ERROR:tooManyFiles', {max: max}));
        }
      },

      'keydown #-resolutionRid': function(e)
      {
        if (e.key === 'Enter')
        {
          this.$id('linkResolution').click();

          return false;
        }
      },

      'click #-addResolution': 'showAddResolutionDialog',
      'click #-linkResolution': 'linkResolution',

      'click .btn[data-action="unlinkResolution"]': function(e)
      {
        var $tr = this.$(e.currentTarget).closest('tr');

        $tr.fadeOut('fast', function() { $tr.remove(); });
      },

      'change input[name$=".user"], input[name*="Owners"]': function(e)
      {
        var $user = this.$(e.currentTarget);

        this.updateUsersSuperior($user);
        this.toggleUsersRequired($user);
        this.checkOwnerValidity();
      },

      'change input[name$=".role"]': function()
      {
        this.checkOwnerValidity();
      },

      'change input[name*="superior"]': function()
      {
        this.checkOwnerValidity();
      },

      'click #-addOwner': function()
      {
        this.addOwner();

        this.$id('addOwner').prop('disabled', this.$id('owners')[0].childElementCount === 3);
      },

      'click .btn[data-action="removeOwner"]': function(e)
      {
        var view = this;
        var $owner = view.$(e.currentTarget).closest('.suggestions-form-owner');

        $owner.fadeOut('fast', function()
        {
          $owner.remove();
          view.$id('addOwner').prop('disabled', view.$id('owners')[0].childElementCount === 3);
          view.checkOwnerValidity();
        });
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.productFamilyObservers = {};
      this.otherConfirmer = false;
      this.resolutionI = 0;
      this.addOwnerI = 0;

      this.listenTo(kaizenDictionaries.sections, 'add remove change', this.onSectionUpdated);
    },

    getTemplateData: function()
    {
      return {
        today: time.format(new Date(), 'YYYY-MM-DD'),
        statuses: kaizenDictionaries.kzStatuses,
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
      var owners = {
        total: {},
        suggestion: {},
        kaizen: {}
      };
      var maxPerType = 2;
      var maxOverall = 3;
      var $suggestion;
      var $kaizen;

      if (this.options.editMode)
      {
        ['suggestion', 'kaizen'].forEach(function(kind)
        {
          for (var i = 0; i < 2; ++i)
          {
            var ownerId = view.$id(kind + 'Owners-' + i).val();

            if (!ownerId)
            {
              continue;
            }

            owners[kind][ownerId] = 1;
            owners.total[ownerId] = 1;

            var $superior = view.$id(kind + 'Superiors-' + i);

            $superior[0].setCustomValidity(
              $superior.val() === ownerId ? view.t('FORM:owners:superior') : ''
            );
          }
        });

        $suggestion = view.$id('suggestionOwners-0');
        $kaizen = view.$id('kaizenOwners-0');

        view.$id('kaizenOwners-1')[0].setCustomValidity(
          Object.keys(owners.total).length > maxOverall
            ? view.t('FORM:owners:tooMany:overall', {max: maxOverall})
            : ''
        );
      }
      else
      {
        view.$('.suggestions-form-owner').each(function(i, ownerEl)
        {
          var $owner = view.$(ownerEl);
          var ownerId = $owner.find('input[name$=".user"]').val();

          if (!ownerId)
          {
            return;
          }

          if ($owner.find('input[value="suggestion"]:checked').length)
          {
            owners.suggestion[ownerId] = 1;
            owners.total[ownerId] = 1;
          }

          if ($owner.find('input[value="kaizen"]:checked').length)
          {
            owners.kaizen[ownerId] = 1;
            owners.total[ownerId] = 1;
          }

          var $superior = $owner.find('input[name$=".superior"]');

          $superior[0].setCustomValidity(
            $superior.val() === ownerId ? view.t('FORM:owners:superior') : ''
          );
        });

        var $owners = this.$id('owners');

        $suggestion = $owners.find('input[value="suggestion"]').first();
        $kaizen = $owners.find('input[value="kaizen"]').first();

        $owners.find('input[name$=".user"]').first()[0].setCustomValidity(
          Object.keys(owners.total).length > maxOverall
            ? view.t('FORM:owners:tooMany:overall', {max: maxOverall})
            : ''
        );
      }

      $suggestion[0].setCustomValidity(
        Object.keys(owners.suggestion).length > maxPerType
          ? view.t('FORM:owners:tooMany:suggestion', {max: maxPerType})
          : ''
      );
      $kaizen[0].setCustomValidity(
        Object.keys(owners.kaizen).length > maxPerType
          ? view.t('FORM:owners:tooMany:kaizen', {max: maxPerType})
          : ''
      );
      this.$id('confirmer')[0].setCustomValidity(
        !confirmer || !owners.total[confirmer.id] ? '' : view.t('FORM:owners:confirmer', {
          kind: owners.suggestion[confirmer.id] ? 'suggestion' : 'kaizen'
        })
      );
    },

    submitRequest: function($submitEl, formData)
    {
      var view = this;
      var uploadFormData = new FormData();
      var files = 0;

      view.$('input[type="file"]').each(function()
      {
        var name = this.name.replace('attachments.', '');

        for (let i = 0; i < this.files.length; ++i)
        {
          uploadFormData.append(name, this.files[i]);

          files += 1;
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
        formData.attachments = {
          added: attachments
        };

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

      if (formData.kom)
      {
        formData.status = 'kom';
      }

      delete formData.owners;
      delete formData.observers;
      delete formData.attachments;
      delete formData.changes;
      delete formData.suggestionOwners;
      delete formData.kaizenOwners;

      return formData;
    },

    serializeForm: function(formData)
    {
      var view = this;

      formData.categories = formData.categories.split(',');
      formData.confirmer = setUpUserSelect2.getUserInfo(this.$id('confirmer'));
      formData.subscribers = view.$id('subscribers').select2('data').map(function(subscriber)
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

      if (view.options.editMode)
      {
        var oldCoordSections = {};
        var newCoordSections = {};

        view.model.get('coordSections').forEach(function(coordSection)
        {
          oldCoordSections[coordSection._id] = coordSection;
        });

        view.$id('coordSections').find('tr').each(function()
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

        formData.suggestionSuperiors = [];
        formData.suggestionOwners = [];
        formData.kaizenSuperiors = [];
        formData.kaizenOwners = [];

        ['suggestion', 'kaizen'].forEach(function(kind)
        {
          for (var i = 0; i < 2; ++i)
          {
            var superior = setUpUserSelect2.getUserInfo(view.$id(kind + 'Superiors-' + i));
            var owner = setUpUserSelect2.getUserInfo(view.$id(kind + 'Owners-' + i));

            if (!superior || !owner)
            {
              continue;
            }

            if (i === 1 && formData[kind + 'Owners'][0].id === owner.id)
            {
              continue;
            }

            formData[kind + 'Superiors'].push(superior);
            formData[kind + 'Owners'].push(owner);
          }
        });
      }
      else
      {
        formData.coordSections = [];

        formData.suggestionSuperiors = [];
        formData.suggestionOwners = [];
        formData.kaizenSuperiors = [];
        formData.kaizenOwners = [];

        view.$('.suggestions-form-owner').each(function()
        {
          var $owner = view.$(this);
          var superior = setUpUserSelect2.getUserInfo($owner.find('input[name$=".superior"]'));
          var owner = setUpUserSelect2.getUserInfo($owner.find('input[name$=".user"]'));

          if (!superior || !owner)
          {
            return;
          }

          if ($owner.find('input[value="suggestion"]:checked').length
            && !formData.suggestionOwners.some(function(o) { return o.id === owner.id; }))
          {
            formData.suggestionSuperiors.push(superior);
            formData.suggestionOwners.push(owner);
          }

          if ($owner.find('input[value="kaizen"]:checked').length
            && !formData.kaizenOwners.some(function(o) { return o.id === owner.id; }))
          {
            formData.kaizenSuperiors.push(superior);
            formData.kaizenOwners.push(owner);
          }
        });
      }

      if (formData.status === 'kom')
      {
        formData.status = 'finished';
        formData.kom = true;
      }
      else
      {
        formData.kom = false;
      }

      if (view.$id('resolutionsGroup').hasClass('hidden'))
      {
        formData.resolutions = [];
      }
      else
      {
        formData.resolutions = (formData.resolutions || []).map(function(r)
        {
          r.rid = +r.rid;

          return r;
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
      this.setUpOwners();

      if (this.options.editMode)
      {
        this.renderCoordSections();
        this.setUpCoordSectionSelect2();
      }
      else
      {
        this.setUpCoordSectionsSelect2();
      }

      this.setUpResolutions();
      this.toggleStatuses();
      this.toggleRequiredToFinishFlags();
      this.togglePanels();
      this.toggleFields();

      this.$('input[autofocus]').focus();
    },

    setUpSectionSelect2: function()
    {
      var id = this.model.get('section');
      var model = kaizenDictionaries.sections.get(id);
      var map = {};

      kaizenDictionaries.sections.forEntryType('suggestions').forEach(function(s)
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
        multiple: this.options.editMode && this.model.get('categories').length > 1,
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

      if (confirmersList.length && (currentUser.isAllowedTo('SUGGESTIONS:MANAGE') || this.model.isConfirmer()))
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

    setUpOwners: function()
    {
      if (this.options.editMode)
      {
        this.setUpEditOwners();
      }
      else
      {
        this.setUpAddOwners();
      }
    },

    setUpAddOwners: function()
    {
      this.addOwner();

      if (!currentUser.isLoggedIn())
      {
        return;
      }

      var $user = this.$id('owners').find('input[name$=".user"]');
      var user = currentUser.getInfo();

      $user.select2('data', {
        id: user.id,
        text: user.label
      });

      this.updateUsersSuperior($user, true);
      this.toggleUsersRequired($user);
    },

    setUpEditOwners: function()
    {
      var view = this;

      ['suggestion', 'kaizen'].forEach(function(kind)
      {
        var owners = view.model.get(kind + 'Owners');
        var superiors = view.model.get(kind + 'Superiors');

        for (var i = 0; i < 2; ++i)
        {
          var $owner = view.$id(kind + 'Owners-' + i);

          view.setUpOwnerUserSelect2($owner, {
            currentUserInfo: owners[i]
          });
          view.setUpOwnerSuperiorSelect2(view.$id(kind + 'Superiors-' + i), {
            currentUserInfo: superiors[i]
          });

          if (owners[i])
          {
            view.toggleUsersRequired($owner);
          }
        }
      });
    },

    updateUsersSuperior: function($user, updateSection)
    {
      var view = this;
      var userId = $user.val();

      if (!userId)
      {
        return;
      }

      var req = this.ajax({
        url: '/suggestions'
          + '?select(suggestionOwners,kaizenOwners,suggestionSuperiors,kaizenSuperiors,section,confirmer)'
          + '&sort(-_id)&limit(1)'
          + '&owners.id=' + userId
      });

      req.done(function(res)
      {
        if (!res.totalCount)
        {
          return;
        }

        var s = res.collection[0];
        var i = s.suggestionOwners.findIndex(function(u) { return u.id === userId; });
        var superior = null;

        if (i === -1)
        {
          i = s.kaizenOwners.findIndex(function(u) { return u.id === userId; });

          if (i !== -1)
          {
            superior = s.kaizenSuperiors[i];
          }
        }
        else
        {
          superior = s.suggestionSuperiors[i];
        }

        $user
          .closest('.row')
          .find('input[name*="uperior"]')
          .select2('data', !superior ? null : {
            id: superior.id,
            text: superior.label
          });

        if (!updateSection)
        {
          return;
        }

        view.$id('section').select2('val', s.section).trigger('change');
        view.$id('confirmer').select2('data', {
          id: s.confirmer.id,
          text: s.confirmer.label
        });
      });
    },

    toggleUsersRequired: function($user)
    {
      var required = !!$user.val();

      $user
        .closest('.row')
        .find('input[name*="uperior"]')
        .prop('required', required)
        .closest('.form-group')
        .toggleClass('has-required-select2', required)
        .find('.control-label')
        .toggleClass('is-required', required);
    },

    addOwner: function()
    {
      var $row = this.renderPartial(addOwnerTemplate, {
        i: this.addOwnerI++
      });

      this.$id('owners').append($row);

      this.setUpOwnerUserSelect2($row.find('input[name$=".user"]'));
      this.setUpOwnerSuperiorSelect2($row.find('input[name$=".superior"]'));
    },

    setUpOwnerUserSelect2: function($user, options)
    {
      setUpUserSelect2($user, Object.assign({
        activeOnly: true,
        noPersonnelId: true
      }, options));
    },

    setUpOwnerSuperiorSelect2: function($superior, options)
    {
      setUpUserSelect2($superior, Object.assign({
        activeOnly: true,
        noPersonnelId: true,
        rqlQueryDecorator: function(rqlQuery)
        {
          var superiorFuncs = kaizenDictionaries.settings.getValue('superiorFuncs');

          if (Array.isArray(superiorFuncs) && superiorFuncs.length)
          {
            rqlQuery.selector.args.push({
              name: 'in',
              args: ['prodFunction', superiorFuncs]
            });
          }
        }
      }, options));
    },

    setUpCoordSectionsSelect2: function()
    {
      var $coordSection = this.$id('coordSections');

      var data = kaizenDictionaries.sections
        .filter(function(s) { return s.get('coordinators').length > 0; })
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

    toggleRequiredToFinishFlags: function()
    {
      var selectedStatus = this.$('input[name="status"]:checked').val();
      var required = selectedStatus === 'finished' || selectedStatus === 'kom';
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

      if (required)
      {
        this.toggleRequiredFlags();
      }
    },

    handleRequiredToFinishFlags: function(prop) // eslint-disable-line no-unused-vars
    {

    },

    toggleStatuses: function()
    {
      if (!this.options.editMode)
      {
        this.$id('statusGroup').addClass('hidden');

        return;
      }

      if (this.model.canManage() || this.model.isConfirmer())
      {
        return;
      }

      var enabled = {};
      var status = this.model.get('status');
      var $status = this.$id('status');

      enabled[status] = true;

      if ((status === 'new' && (this.model.isCreator() || this.model.isSuggestionOwner()))
        || (status === 'inProgress' && this.model.isKaizenOwner()))
      {
        enabled.cancelled = true;
      }

      $status.find('input').each(function()
      {
        this.parentNode.classList.toggle('disabled', !this.checked && !enabled[this.value]);
      });

      this.$id('statusGroup').removeClass('hidden');
    },

    toggleFields: function()
    {
      var view = this;

      if (view.model.get('status') !== 'inProgress'
        || view.model.isConfirmer()
        || view.model.canManage())
      {
        return;
      }

      view.$id('section').select2('readonly', true);
      view.$id('confirmer').select2('readonly', true);

      view.$id('productFamily-other').addClass('hidden');

      view.$id('suggestionPanelBody').find('.form-group').each(function()
      {
        var fieldEl = view.$(this).find('> input, > textarea')[0];

        if (fieldEl.tabIndex === -1)
        {
          view.$(fieldEl).select2('readonly', true);
        }
        else
        {
          fieldEl.readOnly = true;
        }
      });
    },

    isKaizenAvailable: function()
    {
      return this.options.editMode;
    },

    togglePanels: function()
    {
      var kaizenAvailable = this.isKaizenAvailable();

      this.$id('panel-kaizen').toggleClass('hidden', !kaizenAvailable);

      if (kaizenAvailable)
      {
        this.$id('suggestionOwners')
          .closest('.form-group')
          .removeClass('col-lg-6')
          .addClass('col-lg-12');

        this.$id('suggestedKaizenOwners')
          .closest('.form-group')
          .addClass('hidden');
      }
      else
      {
        this.$id('suggestionOwners')
          .closest('.form-group')
          .removeClass('col-lg-12')
          .addClass('col-lg-6');

        this.$id('suggestedKaizenOwners')
          .closest('.form-group')
          .removeClass('hidden');
      }
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
    },

    setUpResolutions: function()
    {
      this.toggleResolutions();
      this.renderResolutions();
    },

    toggleResolutions: function()
    {
      var kaizenEvent = this.$id('categories').val().split(',').includes('KI');
      var dialog = viewport.currentDialog === this;

      this.$id('resolutionsGroup').toggleClass('hidden', !kaizenEvent || dialog);
    },

    renderResolutions: function()
    {
      this.$id('resolutions').html('');

      (this.model.get('resolutions') || []).forEach(this.addResolution, this);
    },

    addResolution: function(resolution)
    {
      this.$id('resolutions').append(this.renderPartialHtml(resolutionRowTemplate, {
        i: ++this.resolutionI,
        resolution: resolution
      }));
    },

    linkResolution: function()
    {
      var view = this;
      var rid = parseInt(view.$id('resolutionRid').val(), 10);

      if (isNaN(rid)
        || rid <= 0
        || rid === view.model.get('rid')
        || view.$id('resolutions').find('input[name$=".rid"][value="' + rid + '"]').length)
      {
        view.$id('resolutionRid').val('').focus();

        return;
      }

      viewport.msg.loading();

      var $actions = this.$id('resolutionsActions').find('.form-control, .btn').prop('disabled', true);

      var req = this.ajax({url: '/suggestions/' + rid + '?select(rid,status,subject)'});

      req.fail(function()
      {
        resultTips.show({
          type: 'error',
          text: view.t('resolutions:error:' + (req.status === 404 ? 'notFound' : 'failure')),
          time: 2000,
          el: view.$id('resolutionsActions')[0]
        });
      });

      req.done(function(resolution)
      {
        resolution.type = 'suggestion';

        view.addResolution(resolution);

        $actions.prop('disabled', false);
        view.$id('resolutionRid').val('').focus();
      });

      req.always(function()
      {
        viewport.msg.loaded();

        $actions.prop('disabled', false);
      });
    },

    showAddResolutionDialog: function()
    {
      var view = this;
      var model = new Suggestion();
      var dialogView = new view.constructor({
        dialogClassName: 'suggestions-form-dialog',
        editMode: false,
        model: model,
        formMethod: 'POST',
        formAction: model.url(),
        formActionText: view.t('core', 'FORM:ACTION:add'),
        failureText: view.t('core', 'FORM:ERROR:addFailure'),
        panelTitleText: view.t('core', 'PANEL:TITLE:addForm')
      });

      dialogView.handleSuccess = function()
      {
        view.addResolution({
          _id: model.id,
          rid: model.get('rid'),
          type: 'suggestion',
          status: model.get('status'),
          subject: model.get('subject')
        });

        viewport.closeDialog();
      };

      viewport.showDialog(dialogView);
    }

  });
});
