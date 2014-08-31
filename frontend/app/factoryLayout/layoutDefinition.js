// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(function()
{
  'use strict';

  return [
    {
      _id: 'LPd',
      position: {x: 10, y: 10},
      points: [
        [0, 0],
        [0, 350],
        [300, 350],
        [300, 600],
        [600, 600],
        [600, 0]
      ],
      fillColor: '#00aaff',
      prodLines: [
        {
          x: 10,
          y: 10,
          h: 340
        },
        {
          x: 310,
          y: 10,
          h: 580
        }
      ]
    },
    {
      _id: 'LPa',
      position: {x: 610, y: 10},
      points: [
        [0, 0],
        [0, 600],
        [430, 600],
        [430, 0]
      ],
      fillColor: '#FFFF80',
      prodLines: [
        {
          x: 10,
          y: 10,
          h: 580
        },
        {
          x: 230,
          y: 10,
          h: 580
        }
      ]
    },
    {
      _id: 'LPb',
      position: {x: 1040, y: 10},
      points: [
        [0, 0],
        [0, 600],
        [430, 600],
        [430, 0]
      ],
      fillColor: '#99dd99',
      prodLines: [
        {
          x: 10,
          y: 10,
          h: 580
        },
        {
          x: 230,
          y: 10,
          h: 580
        }
      ]
    },
    {
      _id: 'LPc',
      position: {x: 1470, y: 10},
      points: [
        [0, 0],
        [0, 600],
        [440, 600],
        [440, 0]
      ],
      fillColor: '#C080C0',
      prodLines: [
        {
          x: 10,
          y: 10,
          h: 580
        },
        {
          x: 240,
          y: 10,
          h: 580
        }
      ]
    },
    {
      _id: 'LD',
      position: {x: 10, y: 360},
      points: [
        [0, 0],
        [0, 250],
        [75, 250],
        [75, 500],
        [800, 500],
        [800, 710],
        [1320, 710],
        [1320, 500],
        [1900, 500],
        [1900, 250],
        [300, 250],
        [300, 0]
      ],
      fillColor: '#FFD580',
      prodLines: []
    }
  ];
});
