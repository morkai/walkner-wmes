// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'h5.rql/index',
  'app/core/util/transliterate',
  'app/i18n',
  'app/user'
], function(
  _,
  rql,
  transliterate,
  t,
  user
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

  function userToData(user, textFormatter, query)
  {
    if (user.id && user.text)
    {
      return user;
    }

    user.name = user.lastName && user.firstName
      ? (user.lastName + ' ' + user.firstName)
      : (user.name || user.login || user._id);

    return {
      id: user._id,
      text: textFormatter(user, user.name, query),
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

  function filterDuplicates(users)
  {
    var map = {};

    _.forEach(users, function(newUser)
    {
      var searchName = newUser.searchName;
      var mappedUser = map[searchName];

      // First
      if (!mappedUser)
      {
        map[searchName] = newUser;

        return;
      }

      // Prefer active users
      if (mappedUser.active === false && newUser.active === true)
      {
        map[searchName] = newUser;

        return;
      }

      if (mappedUser.active === true && newUser.active === false)
      {
        return;
      }

      // Prefer users with e-mail
      if (!mappedUser.email && newUser.email)
      {
        map[searchName] = newUser;

        return;
      }

      if (mappedUser.email && !newUser.email)
      {
        return;
      }

      // Prefer users from PHILIPS
      if (mappedUser.company !== 'PHILIPS' && newUser.company === 'PHILIPS')
      {
        map[searchName] = newUser;
      }
    });

    return _.values(map);
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
    return options.textFormatter || formatText.bind(null, !!options.noPersonnelId);
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

    data.sort(function(a, b)
    {
      return a.text.localeCompare(b.text, undefined, {ignorePunctuation: true, sensitivity: 'base'});
    });

    return data;
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
      placeholder: t('users', 'select2:placeholder')
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
          var results = [getSystemData(), getRootData()].filter(function(user)
          {
            return user.text.toLowerCase().indexOf(query.term.toLowerCase()) !== -1;
          });

          var users = options.filterDuplicates === false
            ? results.concat(data.collection || [])
            : results.concat(filterDuplicates(data.collection || []));

          if (userFilter)
          {
            users = users.filter(userFilter);
          }

          return {
            results: users
              .map(function(user) { return userToData(user, textFormatter, query); })
              .sort(function(a, b) { return a.text.localeCompare(b.text); })
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
