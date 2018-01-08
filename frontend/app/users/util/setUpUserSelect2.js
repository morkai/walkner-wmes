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

  function formatText(user, name, query) // eslint-disable-line no-unused-vars
  {
    if (user.personellId)
    {
      name += ' (' + user.personellId + ')';
    }

    return name;
  }

  function userToData(user, textFormatter, query)
  {
    if (user.id && user.text)
    {
      return user;
    }

    var name = user.lastName && user.firstName
      ? (user.lastName + ' ' + user.firstName)
      : (user.name || user.login || user._id);

    return {
      id: user._id,
      text: (textFormatter || formatText)(user, name, query),
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

  function createDefaultRqlQuery(rql, term)
  {
    term = term.trim();

    var property = /^[0-9]+$/.test(term) ? 'personellId' : 'searchName';

    if (property === 'searchName')
    {
      term = setUpUserSelect2.transliterate(term);
    }

    var options = {
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

    options.sort[property] = 1;

    return rql.Query.fromObject(options);
  }

  function setUpUserSelect2($input, options)
  {
    if (!options)
    {
      options = {};
    }

    var rqlQueryProvider = options.rqlQueryProvider ? options.rqlQueryProvider : createDefaultRqlQuery;
    var userFilter = options.userFilter ? options.userFilter : null;

    $input.select2(_.extend({
      openOnEnter: null,
      allowClear: true,
      minimumInputLength: 3,
      placeholder: t('users', 'select2:placeholder'),
      ajax: {
        cache: true,
        quietMillis: 300,
        url: function(term)
        {
          return '/users' + '?' + rqlQueryProvider(rql, term);
        },
        results: function(data, page, query)
        {
          var results = [getSystemData(), getRootData()].filter(function(user)
          {
            return user.text.toLowerCase().indexOf(query.term.toLowerCase()) !== -1;
          });

          var users = results.concat(filterDuplicates(data.collection || []));

          if (userFilter)
          {
            users = users.filter(userFilter);
          }

          return {
            results: users
              .map(function(user) { return userToData(user, options.textFormatter, query); })
              .sort(function(a, b) { return a.text.localeCompare(b.text); })
          };
        }
      }
    }, options));

    var userId = $input.val();
    var rootData = getRootData();

    if (userId === rootData.id)
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
            return userToData(userData, options.textFormatter);
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
  setUpUserSelect2.transliterate = function(value)
  {
    return transliterate(value.toUpperCase()).replace(/[^A-Z]+/g, '');
  };

  return setUpUserSelect2;
});
