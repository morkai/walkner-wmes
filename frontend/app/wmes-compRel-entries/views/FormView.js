// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/core/util/html',
  'app/core/templates/userInfo',
  'app/data/orgUnits',
  'app/users/util/setUpUserSelect2',
  'app/mrpControllers/util/setUpMrpSelect2',
  '../dictionaries',
  '../Entry',
  'app/wmes-compRel-entries/templates/form',
  'app/wmes-compRel-entries/templates/formFunc'
], function(
  _,
  $,
  user,
  time,
  viewport,
  FormView,
  idAndLabel,
  html,
  userInfoTemplate,
  orgUnits,
  setUpUserSelect2,
  setUpMrpSelect2,
  dictionaries,
  Entry,
  formTemplate,
  funcTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.assign({

      'input #-oldCode': 'resolveComponent',
      'input #-newCode': 'resolveComponent',
      'click #-addFunc': function()
      {
        var funcId = this.$id('availableFuncs').val();

        if (funcId)
        {
          this.addFunc(funcId, !this.model.getFunc(funcId));
          this.setUpAvailableFuncs();
        }
      },
      'change #-availableFuncs': function()
      {
        var funcId = this.$id('availableFuncs').val();

        this.addFunc(funcId, !this.model.getFunc(funcId));
        this.setUpAvailableFuncs();
      },
      'click .compRel-form-removeFunc': function(e)
      {
        this.removeFunc(this.$(e.target).closest('.compRel-form-func')[0].dataset.id);
      },
      'change #-mrps': function()
      {
        var funcs = [];

        this.$('.compRel-form-func').each(function()
        {
          funcs.push(this.dataset.id);
        });

        this.loadFuncUsers(funcs);
      },
      'change input[name$=".users"]': function(e)
      {
        this.saveFuncUsers(this.$(e.target).closest('.compRel-form-func')[0].dataset.id);
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.funcI = 0;
    },

    destroy: function()
    {
      FormView.prototype.destroy.apply(this, arguments);
    },

    afterRender: function()
    {
      var view = this;

      FormView.prototype.afterRender.apply(view, arguments);

      view.setUpMrpSelect2();

      (view.model.get('funcs') || []).forEach(function(func)
      {
        view.addFunc(func._id, false);
      });

      view.setUpUsersSelect2();
      view.setUpAvailableFuncs();
    },

    checkFuncsValidity: function()
    {
      this.$id('availableFuncs')[0].setCustomValidity(
        this.$('.compRel-form-func').length ? '' : this.t('FORM:ERROR:noFuncs')
      );
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.mrps = formData.mrps ? formData.mrps.join(',') : '';

      return formData;
    },

    serializeForm: function(formData)
    {
      var view = this;

      formData.mrps = formData.mrps.split(',');
      formData.funcs = [];

      this.$('.compRel-form-func').each(function()
      {
        formData.funcs.push(view.model.getFunc(this.dataset.id));
      });

      return formData;
    },

    setUpMrpSelect2: function()
    {
      setUpMrpSelect2(this.$id('mrps'), {
        view: this,
        own: false,
        width: '100%'
      });
    },

    setUpUsersSelect2: function()
    {
      var view = this;
      var funcs = view.model.get('funcs');

      view.$('input[name$=".users"]').each(function(i)
      {
        var $users = setUpUserSelect2(view.$(this), {
          width: '100%',
          multiple: true,
          allowClear: true,
          noPersonnelId: true
        });

        $users.select2('data', funcs[i].users.map(function(u)
        {
          return {
            id: u.id,
            text: u.label
          };
        }));
      });
    },

    setUpAvailableFuncs: function()
    {
      var availableFuncs = {};

      dictionaries.funcs.forEach(function(func)
      {
        availableFuncs[func.id] = func;
      });

      this.$('.compRel-form-func').each(function()
      {
        delete availableFuncs[this.dataset.id];
      });

      var options = '';

      Object.values(availableFuncs).forEach(function(func, i)
      {
        options += html.tag(
          'option',
          {value: func.id, selected: i === 0},
          func.getLabel()
        );
      });

      this.$id('availableFuncs')
        .html(options)
        .prop('disabled', !options);

      this.$id('addFunc').prop('disabled', !options);

      this.checkFuncsValidity();
    },

    resolveComponent: function(e)
    {
      var view = this;
      var codeEl = e.currentTarget;
      var nameEl = view.$(codeEl).closest('.form-group').next().find('input')[0];

      nameEl.value = '';

      if (!/^[0-9]{12}$/.test(codeEl.value.trim()))
      {
        return;
      }

      var reqId = 'validate' + codeEl.name;

      if (view[reqId])
      {
        view[reqId].abort();
      }

      viewport.msg.loading();

      view[reqId] = view.ajax({
        url: '/compRel/entries;resolve-component',
        data: {
          nc12: codeEl.value
        }
      });

      view[reqId].done(function(component)
      {
        nameEl.value = component.name;
      });

      view[reqId].always(function()
      {
        viewport.msg.loaded();
      });
    },

    addFunc: function(funcId, loadUsers)
    {
      if (this.$func(funcId).length)
      {
        return;
      }

      var entryFunc = this.model.getFunc(funcId);

      if (!entryFunc)
      {
        entryFunc = {
          _id: funcId,
          acceptedAt: null,
          acceptedBy: null,
          status: 'pending',
          comment: '',
          users: []
        };

        this.model.attributes.funcs = (this.model.get('funcs') || []).concat(entryFunc);
      }

      var $func = this.renderPartial(funcTemplate, {
        i: ++this.funcI,
        status: entryFunc.status,
        func: {
          _id: funcId,
          label: dictionaries.funcs.getLabel(funcId),
          acceptedAt: entryFunc.acceptedAt ? time.format(entryFunc.acceptedAt, 'LL, HH:mm') : '-',
          acceptedBy: entryFunc.acceptedBy ? userInfoTemplate({userInfo: entryFunc.acceptedBy, noIp: true}) : '-',
          status: this.t('status:' + entryFunc.status)
        }
      });

      this.$id('funcs').append($func);

      var $users = setUpUserSelect2($func.find('input[name$=".users"]'), {
        view: this,
        multiple: true,
        noPersonnelId: true
      });

      $users.select2('data', entryFunc.users.map(function(user)
      {
        return {
          id: user.id,
          text: user.label
        };
      }));

      if (loadUsers)
      {
        this.loadFuncUsers([funcId]);
      }
    },

    removeFunc: function(funcId)
    {
      this.$func(funcId).remove();
      this.setUpAvailableFuncs();
    },

    loadFuncUsers: function(funcs)
    {
      if (!funcs.length)
      {
        return;
      }

      var view = this;

      viewport.msg.loading();

      var req = view.ajax({
        url: '/compRel/entries;resolve-users',
        data: {
          funcs: funcs.join(','),
          mrps: view.$id('mrps').val()
        }
      });

      req.done(function(funcs)
      {
        Object.keys(funcs).forEach(function(funcId)
        {
          view.updateFuncUsers(funcId, funcs[funcId]);
        });
      });

      req.always(function()
      {
        viewport.msg.loaded();
      });
    },

    updateFuncUsers: function(funcId, users)
    {
      var $func = this.$func(funcId);

      if (!$func.length)
      {
        return;
      }

      users.sort(function(a, b)
      {
        return a.label.localeCompare(b.label, undefined, {ignorePunctuation: true});
      });

      $func.find('input[name$=".users"]').select2('data', users.map(function(u)
      {
        return {
          id: u.id,
          text: u.label
        };
      }));

      this.saveFuncUsers(funcId);
    },

    saveFuncUsers: function(funcId)
    {
      var entryFunc = this.model.getFunc(funcId);
      var users = this.$func(funcId).find('input[name$=".users"]').select2('data').map(function(u)
      {
        return {
          id: u.id,
          label: u.text
        };
      });

      if (entryFunc)
      {
        entryFunc.users = users;
      }
    },

    $func: function(id)
    {
      return this.$('.compRel-form-func[data-id="' + id + '"]');
    }

  });
});
