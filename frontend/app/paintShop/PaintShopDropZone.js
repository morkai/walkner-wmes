// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  function id(dropZone)
  {
    return dropZone._id.date + '~' + dropZone._id.mrp;
  }

  return Model.extend({

    nlsDomain: 'paintShop'

  }, {

    id: id,

    parse: function(dropZone)
    {
      return {
        _id: id(dropZone),
        date: dropZone._id.date,
        mrp: dropZone._id.mrp,
        state: dropZone.state
      };
    }

  });
});
