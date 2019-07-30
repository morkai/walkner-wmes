/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.factorylayouts.updateOne({_id: "default"}, {
  $set: {
    "live": [
      {
        "_id": "LPa",
        "position": {
          "x": 100,
          "y": 10
        },
        "points": [
          [
            0,
            0
          ],
          [
            0,
            800
          ],
          [
            430,
            800
          ],
          [
            430,
            0
          ]
        ],
        "fillColor": "#FFFF80",
        "prodLines": [
          {
            "x": 10,
            "y": 10,
            "h": 790
          },
          {
            "x": 230,
            "y": 10,
            "h": 790
          }
        ]
      },
      {
        "_id": "LPb",
        "position": {
          "x": 530,
          "y": 10
        },
        "points": [
          [
            0,
            0
          ],
          [
            0,
            800
          ],
          [
            645,
            800
          ],
          [
            645,
            0
          ]
        ],
        "fillColor": "#99dd99",
        "prodLines": [
          {
            "x": 10,
            "y": 10,
            "h": 790
          },
          {
            "x": 230,
            "y": 10,
            "h": 790
          },
          {
            "x": 450,
            "y": 10,
            "h": 790
          }
        ]
      },
      {
        "_id": "LPc",
        "position": {
          "x": 1175,
          "y": 10
        },
        "points": [
          [
            0,
            0
          ],
          [
            0,
            800
          ],
          [
            645,
            800
          ],
          [
            645,
            0
          ]
        ],
        "fillColor": "#C080C0",
        "prodLines": [
          {
            "x": 10,
            "y": 10,
            "h": 790
          },
          {
            "x": 240,
            "y": 10,
            "h": 790
          },
          {
            "x": 450,
            "y": 10,
            "h": 790
          }
        ]
      },
      {
        "_id": "LD",
        "position": {
          "x": 100,
          "y": 810
        },
        "points": [
          [
            0,
            0
          ],
          [
            0,
            150
          ],
          [
            700,
            150
          ],
          [
            700,
            300
          ],
          [
            1220,
            300
          ],
          [
            1220,
            150
          ],
          [
            1720,
            150
          ],
          [
            1720,
            0
          ],
          [
            0,
            0
          ]
        ],
        "fillColor": "#FFD580",
        "prodLines": []
      }
    ],
    "draft": null
  }
});
