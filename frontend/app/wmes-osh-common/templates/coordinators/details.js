// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/i18n',
  'app/core/templates/userInfo',
  'app/wmes-osh-common/templates/coordinators/table'
], function(
  require,
  t,
  userInfoTemplate,
  tableTemplate
) {
  'use strict';

  return (coordinators, options) =>
  {
    if (!Array.isArray(coordinators) || coordinators.length === 0)
    {
      return '';
    }

    const dictionaries = require('app/wmes-osh-common/dictionaries');

    return tableTemplate({
      kinds: options && options.kinds !== false,
      coordinators: coordinators.map(c => ({
        types: c.types.length === 0
          ? [t('wmes-osh-common', `coordinators:all`)]
          : c.types.map(id => t('wmes-osh-common', `type:${id}`)),
        kinds: c.kinds.length === 0
          ? [t('wmes-osh-common', `coordinators:all`)]
          : c.kinds.map(id => dictionaries.kinds.getLabel(id)),
        users: c.users.map(u => userInfoTemplate(u))
      }))
    });
  };
});
