// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'h5.rql/index',
  'app/core/util/transliterate',
  'app/i18n',
  'app/user',
  'app/data/companies',
  'app/data/loadedModules'
], function(
  _,
  rql,
  transliterate,
  t,
  user,
  companies,
  loadedModules
) {
  'use strict';

  function formatText(noPersonnelId, user, name, query) // eslint-disable-line no-unused-vars
  {
    if (!noPersonnelId && user.personnelId)
    {
      name += ' (' + user.personnelId + ')';
    }

    return name;
  }

  function formatResultWithDescription(result)
  {
    if (_.isEmpty(result.description))
    {
      return result.header;
    }

    var html = '<div class="select2-result-with-description">';
    html += '<h3>' + result.header + '</h3>';
    html += '<p>' + result.description + '</p>';
    html += '</div>';

    return html;
  }

  function userToData(user, textFormatter, query)
  {
    if (user.id && user.text)
    {
      return user;
    }

    user.name = user.lastName || user.firstName
      ? (user.lastName + ' ' + user.firstName).trim()
      : (user.name || user.login || user._id);

    var text = textFormatter(user, user.name, query);
    var header = _.escape(text);
    var description = '';

    if (user.duplicate)
    {
      if (user.personnelId)
      {
        header += ' (' + _.escape(user.personnelId) + ')';
      }

      if (user.syncData.jobTitle)
      {
        description = _.escape(user.syncData.jobTitle);
      }

      var company = companies.get(user.company);

      if (company)
      {
        company = company.get('shortName');
      }
      else if (user.syncData.company)
      {
        company = user.syncData.company;
      }

      if (company)
      {
        if (description)
        {
          description += ' @ ';
        }

        description += _.escape(company);
      }

      var workplace = '';
      var department = '';

      if (loadedModules.isLoaded('wmes-osh') && user.oshWorkplace)
      {
        var oshDictionaries = require('app/wmes-osh-common/dictionaries');
        var oshWorkplace = oshDictionaries.workplaces.get(user.oshWorkplace);
        var oshDepartment = oshDictionaries.departments.get(user.oshDepartment);

        if (oshWorkplace)
        {
          workplace = oshWorkplace.getLabel({long: false});

          if (oshDepartment)
          {
            department = oshDepartment.getLabel({long: false});
          }
        }
      }

      if (!workplace && user.syncData.workplace)
      {
        workplace = user.syncData.workplace;
      }

      if (!department && user.syncData.department)
      {
        department = user.syncData.department;
      }

      if (workplace)
      {
        if (description)
        {
          description += '<br>';
        }

        description += _.escape(workplace);
      }

      if (department)
      {
        if (workplace)
        {
          description += ' \\ ';
        }
        else if (description)
        {
          description += '<br>';
        }

        description += _.escape(department);
      }
    }

    if (!user.active)
    {
      header = '<del>' + header + '</del>';
    }

    return {
      id: user._id,
      text: text,
      header: header,
      description: description,
      user: user
    };
  }

  function getSystemData()
  {
    return {
      id: '$SYSTEM',
      text: t('users', 'select2:users:system'),
      user: null
    };
  }

  function getRootData()
  {
    var root = user.getRootUserData();

    return {
      id: root._id,
      text: root.name || root.login,
      user: root
    };
  }

  function filterDuplicates(allUsers)
  {
    var map = {};

    allUsers.forEach(function(user)
    {
      if (!map[user.searchName])
      {
        map[user.searchName] = [];
      }

      var score = 0;

      if (!user.active)
      {
        score -= 10;
      }

      if (user.email)
      {
        score += 1;
      }

      if (user.mobile && user.mobile.length)
      {
        score += 1;
      }

      if (user.privileges && user.privileges.length)
      {
        score += 1;
      }

      if (user.personnelId)
      {
        score += 1;
      }

      if (user.syncData)
      {
        if (/PHILIPS|SIGNIFY/i.test(user.syncData.company))
        {
          score += 1;
        }
      }

      if (user.orgUnitId)
      {
        score += 1;
      }

      if (user.oshDepartment)
      {
        score += 1;
      }

      user.duplicate = false;
      user.score = score;

      map[user.searchName].push(user);
    });

    var result = [];

    _.values(map).forEach(function(users)
    {
      users.forEach(function(user)
      {
        user.duplicate = users.length > 1;

        result.push(user);
      });
    });

    return result;
  }

  function createDefaultRqlQuery(rql, term, options)
  {
    term = term.trim();

    var property = /^[0-9]+$/.test(term) ? 'personnelId' : 'searchName';

    if (property === 'searchName')
    {
      term = setUpUserSelect2.transliterate(term);
    }

    var rqlQuery = {
      fields: {},
      sort: {},
      limit: 20,
      skip: 0,
      selector: {
        name: 'and',
        args: [
          {name: 'regex', args: [property, '^' + term]}
        ]
      }
    };

    if (options.activeOnly)
    {
      rqlQuery.selector.args.push({name: 'eq', args: ['active', true]});
    }

    rqlQuery.sort[property] = 1;

    if (options.rqlQueryDecorator)
    {
      options.rqlQueryDecorator(rqlQuery, term, options);
    }

    return rql.Query.fromObject(rqlQuery);
  }

  function resolveTextFormatter(options)
  {
    return options.textFormatter || formatText.bind(null, options.noPersonnelId !== false);
  }

  function prepareData(options)
  {
    var textFormatter = resolveTextFormatter(options);
    var data = [];

    (options.currentUserInfo || []).forEach(function(userInfo)
    {
      if (!options.collection.get(userInfo[user.idProperty]))
      {
        data.push({
          id: userInfo[user.idProperty],
          text: userInfo.label,
          user: userInfo
        });
      }
    });

    options.collection.forEach(function(user)
    {
      data.push(userToData(user.toJSON(), textFormatter));
    });

    data.sort(sortUsers);

    return data;
  }

  function sortUsers(a, b)
  {
    var cmp = (a.user && a.user.searchName || a.text).localeCompare(
      b.user && b.user.searchName || b.text,
      undefined,
      {ignorePunctuation: true, sensitivity: 'base'}
    );

    if (cmp === 0)
    {
      cmp = (b.user && b.user.score || 0) - (a.user && a.user.score || 0);
    }

    return cmp;
  }

  function setUpUserSelect2($input, options)
  {
    if (!$input.length)
    {
      return $input;
    }

    if (!options)
    {
      options = {};
    }

    var textFormatter = resolveTextFormatter(options);
    var defaultOptions = {
      openOnEnter: null,
      allowClear: true,
      minimumInputLength: 3,
      placeholder: t('users', 'select2:placeholder'),
      formatResult: formatResultWithDescription
    };

    if (options.collection)
    {
      options.minimumInputLength = 0;
      options.placeholder = ' ';
      options.data = prepareData(options);
    }
    else
    {
      var rqlQueryProvider = options.rqlQueryProvider ? options.rqlQueryProvider : createDefaultRqlQuery;
      var userFilter = options.userFilter ? options.userFilter : null;

      defaultOptions.ajax = {
        cache: true,
        quietMillis: 300,
        url: function(term)
        {
          return '/users' + '?' + rqlQueryProvider(rql, term, options);
        },
        results: function(data, page, query)
        {
          var results = [getSystemData(), getRootData()]
            .filter(function(user) { return user.text.toLowerCase().indexOf(query.term.toLowerCase()) !== -1; })
            .concat(filterDuplicates(data.collection || []));

          if (userFilter)
          {
            results = results.filter(userFilter);
          }

          return {
            results: results
              .map(function(user) { return userToData(user, textFormatter, query); })
              .sort(sortUsers)
          };
        }
      };
    }

    $input.select2(_.assign(defaultOptions, options));

    if (options.collection)
    {
      var instance = $input.data('select2');
      var oldDestroy = instance.destroy;

      instance.destroy = function()
      {
        options.collection.off(null, null, $input);
        oldDestroy.apply(instance, arguments);
      };

      options.collection.once('reset add change remove', function()
      {
        setUpUserSelect2($input, options);
      });
    }

    var userId = $input.val();
    var rootData = getRootData();
    var userInfo = options.currentUserInfo;

    if (userInfo)
    {
      if (Array.isArray(userInfo))
      {
        $input.select2('data', userInfo.map(function(u)
        {
          return {
            id: u.id,
            text: u.label,
            user: u
          };
        }));
      }
      else
      {
        $input.select2('data', {
          id: userInfo.id,
          text: userInfo.label,
          user: userInfo
        });
      }
    }
    else if (userId === rootData.id)
    {
      $input.select2('data', rootData);
    }
    else if (userId === '$SYSTEM')
    {
      $input.select2('data', getSystemData());
    }
    else if (userId && options.view)
    {
      var req = options.view.ajax({
        type: 'GET',
        url: '/users?_id=in=(' + userId + ')'
      });

      req.done(function(res)
      {
        if (res.collection && res.collection.length)
        {
          var data = res.collection.map(function(userData)
          {
            return userToData(userData, textFormatter);
          });

          $input.select2('data', options.multiple ? data : data[0]);

          if (options.onDataLoaded)
          {
            options.onDataLoaded();
          }
        }
      });
    }

    return $input;
  }

  setUpUserSelect2.defaultRqlQueryProvider = createDefaultRqlQuery;
  setUpUserSelect2.filterDuplicates = filterDuplicates;
  setUpUserSelect2.transliterate = function(value)
  {
    return transliterate(value.toUpperCase()).replace(/[^A-Z0-9]+/g, '');
  };
  setUpUserSelect2.getUserInfo = function($input)
  {
    var data = $input.select2('data');
    var select2 = $input.data('select2');
    var userInfoDecorators = user.getInfo.decorators.concat(
      select2 && select2.opts.userInfoDecorators || []
    );

    if (Array.isArray(data))
    {
      return data.map(function(item)
      {
        var userInfo = {};
        var userData = item.user || {};

        userInfo[user.idProperty] = item.id;
        userInfo.label = item.text;

        userInfoDecorators.forEach(function(decorate)
        {
          decorate(userInfo, userData);
        });

        return userInfo;
      });
    }

    if (data)
    {
      var userInfo = {};
      var userData = data.user || {};

      userInfo[user.idProperty] = data.id;
      userInfo.label = data.text;

      userInfoDecorators.forEach(function(decorate)
      {
        decorate(userInfo, userData);
      });

      return userInfo;
    }

    return null;
  };

  return setUpUserSelect2;
});
