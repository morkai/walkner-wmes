// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/users/UserCollection'
], function(
  UserCollection
) {
  'use strict';

  return UserCollection.extend({

    rqlQuery: 'select(firstName,lastName,personnelId,card,cardUid)&limit(0)&privileges=ISA%3AWHMAN'

  });
});
