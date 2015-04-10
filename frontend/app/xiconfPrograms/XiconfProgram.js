// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../core/Model'
], function(
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/xiconf/programs',

    clientUrlRoot: '#xiconf/programs',

    privilegePrefix: 'XICONF',

    topicPrefix: 'xiconfPrograms',

    nlsDomain: 'xiconfPrograms',

    labelAttribute: 'name',

    defaults: function()
    {
      return {
        type: 't24vdc',
        name: '',
        steps: []
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.createdAt = time.format(obj.createdAt, 'LLLL');
      obj.updatedAt = time.format(obj.updatedAt, 'LLLL');

      return obj;
    }

  }, {

    PROGRAM_TYPES: ['t24vdc'],
    STEP_TYPES: ['wait', 'pe', 'sol', 'fn']

  });
});
