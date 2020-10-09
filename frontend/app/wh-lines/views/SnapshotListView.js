// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView',
  'app/wh-lines/templates/snapshotList'
], function(
  ListView,
  template
) {
  'use strict';

  return ListView.extend({

    template: template

  });
});
