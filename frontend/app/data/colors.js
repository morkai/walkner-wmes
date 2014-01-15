define(function()
{
  'use strict';

  var COLORS = [
    '#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce', '#492970', '#f28f43', '#77a1e5',
    '#c42525', '#a6c96a', '#aaff00', '#00aaff', '#ffaa00', '#00ffaa', '#aa00ff', '#ff00aa',
    '#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C',
    '#B5CA92', '#666666', '#809FFF', '#9F80FF', '#DF80FF', '#FF80DF', '#FF809F', '#FF9F80',
    '#FFDF80', '#DFFF80', '#9FFF80', '#80FF9F', '#80FFDF', '#80DFFF', '#4271FF', '#0544FF',
    '#FFD042', '#FFC105', '#3366FF', '#6633FF', '#CC33FF', '#FF33CC', '#FF3366', '#FF6633',
    '#FFCC33', '#CCFF33', '#66FF33', '#33FF66', '#33FFCC', '#33CCFF', '#003DF5', '#002EB8',
    '#F5B800', '#B88A00', '#0039E6', '#3900E6', '#AC00E6', '#E600AC', '#E60039', '#E63900',
    '#E6AC00', '#ACE600', '#39E600', '#00E639', '#00E6AC', '#00ACE6', '#245BFF', '#6188FF',
    '#FFC824', '#FFD761'
  ];

  var groups = {};

  function genRandomColor()
  {
    // http://stackoverflow.com/a/1152508
    return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
  }

  return {
    getColor: function(group, key)
    {
      if (typeof groups[group] === 'undefined')
      {
        groups[group] = {
          free: [].concat(COLORS),
          assigned: {}
        };
      }

      group = groups[group];

      if (typeof group.assigned[key] === 'string')
      {
        return group.assigned[key];
      }

      group.assigned[key] = group.free.length ? group.free.shift() : genRandomColor();

      return group.assigned[key];
    }
  };
});
