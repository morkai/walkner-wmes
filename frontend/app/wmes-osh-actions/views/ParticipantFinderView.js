// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'select2',
  'app/viewport',
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-actions/templates/form/participantFinder'
], function(
  _,
  select2,
  viewport,
  View,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return View.extend({

    template,

    nlsDomain: 'wmes-osh-actions',

    events: {

      'submit': function()
      {
        this.submit();

        return false;
      },

      'change input[name="source"]': function()
      {
        const brigade = this.$('input[name="source"]:checked').val() === 'brigade';

        this.$id('brigadeContainer').toggleClass('hidden', !brigade);
        this.$id('departmentContainer').toggleClass('hidden', brigade);
      },

      'change #-brigade': function()
      {
        const leader = this.$id('brigade').val();

        if (leader)
        {
          this.loadBrigade(leader);
        }
      },

      'change #-department': function()
      {
        const department = this.$id('department').val();

        if (department)
        {
          this.loadDepartment(+department);
        }
      },

      'click #-unselectAll': function()
      {
        this.$id('users').find('input[type="checkbox"]').prop('checked', false);
      },

      'click #-selectAll': function()
      {
        this.$id('users').find('input[type="checkbox"]').prop('checked', true);
      },

      'click #-remove': function()
      {
        this.$id('users').find('input:not(:checked)').parent().remove();
      }

    },

    afterRender: function()
    {
      this.setUpBrigadeSelect2();
      this.setUpDepartmentSelect2();

      this.$('input[value="brigade"]').click();
    },

    setUpBrigadeSelect2: function()
    {
      setUpUserSelect2(this.$id('brigade'), {
        view: this
      });
    },

    setUpDepartmentSelect2: function()
    {
      const data = [];
      const workplaceToDepartments = {};
      const LONG = {long: true};

      dictionaries.departments.forEach(department =>
      {
        if (!department.get('active'))
        {
          return;
        }

        const workplace = department.get('workplace');

        if (!workplaceToDepartments[workplace])
        {
          workplaceToDepartments[workplace] = [];
        }

        workplaceToDepartments[workplace].push({
          id: department.id.toString(),
          selection: dictionaries.workplaces.getLabel(workplace) + ' > ' + department.getLabel(),
          text: department.getLabel(LONG)
        });
      });

      Object
        .keys(workplaceToDepartments)
        .sort((a, b) =>
        {
          a = dictionaries.workplaces.getLabel(a, LONG);
          b = dictionaries.workplaces.getLabel(b, LONG);

          return a.localeCompare(b, undefined, {numeric: true, ignorePunctuation: true});
        })
        .forEach(workplaceId =>
        {
          const workplace = dictionaries.workplaces.get(workplaceId);
          const children = workplaceToDepartments[workplaceId];

          children.sort((a, b) => a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true}));

          data.push({
            text: workplace ? workplace.getLabel(LONG) : workplaceId,
            children
          });
        });

      this.$id('department').select2({
        placeholder: this.t('participantFinder:department:placeholder'),
        data,
        formatSelection: (item) =>
        {
          const text = _.escape(item.selection || item.text);

          if (item.deactivated)
          {
            return '<span style="text-decoration: line-through">' + text + '</span>';
          }

          return text;
        },
        formatResult: (item, $container, query, e) =>
        {
          const html = [];

          html.push('<span style="text-decoration: ' + (item.deactivated ? 'line-through' : 'initial') + '">');
          select2.util.markMatch(item.text, query.term, html, e);
          html.push('</span>');

          return html.join('');
        }
      });

      this.$id('departmentContainer').addClass('hidden');
    },

    addUsers: function(newUsers)
    {
      this.$id('noUsers').remove();

      const users = new Set();

      this.$('input[name="user"]').each((i, el) =>
      {
        users.add(el.value);
      });

      newUsers.forEach(user =>
      {
        if (users.has(user.id))
        {
          return;
        }

        users.add(user.id);

        this.addUser(user);
      });

      viewport.adjustDialogBackdrop();
    },

    addUser: function(user)
    {
      this.$id('users').append(`
        <div class="checkbox">
          <label>
            <input type="checkbox" name="user" value="${user.id}" checked>
            <span>${_.escape(user.label)}</span>
          </label>
        </div>
      `);
    },

    toggleControls: function(enabled)
    {
      this.$id('submit').prop('disabled', !enabled);
      this.$id('brigade').select2('enable', enabled);
      this.$id('department').select2('enable', enabled);
    },

    loadBrigade: function(leaderId)
    {
      this.toggleControls(false);

      viewport.msg.loading();

      const req = this.ajax({
        url: `/osh/brigades?sort(-date)&limit(1)&leader.id=${leaderId}`
      });

      req.fail(() =>
      {
        viewport.msg.loadingFailed();
      });

      req.done(res =>
      {
        viewport.msg.loaded();

        if (res.totalCount === 0)
        {
          viewport.msg.show({
            type: 'warning',
            time: 2500,
            text: this.t('participantFinder:noBrigade')
          });
        }
        else
        {
          const brigade = res.collection[0];
          const users = [brigade.leader].concat(brigade.members);

          this.addUsers(users);
        }
      });

      req.always(() =>
      {
        this.toggleControls(true);
      });
    },

    loadDepartment: function(departmentId)
    {
      this.toggleControls(false);

      viewport.msg.loading();

      const req = this.ajax({
        url: `/osh/actions;participants?department=${departmentId}`
      });

      req.fail(() =>
      {
        viewport.msg.loadingFailed();
      });

      req.done(users =>
      {
        viewport.msg.loaded();

        if (users.length === 0)
        {
          viewport.msg.show({
            type: 'warning',
            time: 2500,
            text: this.t('participantFinder:noDepartment')
          });
        }
        else
        {
          this.addUsers(users);
        }
      });

      req.always(() =>
      {
        this.toggleControls(true);
      });
    },

    submit: function()
    {
      const users = [];

      this.$('input[name="user"]').each((i, el) =>
      {
        if (!el.checked)
        {
          return;
        }

        users.push({
          id: el.value,
          label: el.nextElementSibling.textContent
        });
      });

      this.trigger('users', users);
    }

  });
});
