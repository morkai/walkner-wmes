/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.paintshoploads.createIndex({'_id.ts': -1});
db.paintshoploads.createIndex({'_id.c': 1, '_id.ts': -1});

db.settings.updateOne({_id: 'production.taktTime.coeffs'}, {$set: {
  value: {
    "*": [
      {
        "qty": 0,
        "wcs": {
          "2DIMECO": 0.84,
          "4DIMECO": 0.83,
          "5DIMECO": 0.8,
          "AMADA": 0.83,
          "AMADA2": 0.86,
          "AMADA3": 0.83,
          "ARC31401": 0.86,
          "ARC34912": 0.87,
          "DEFOIL": 0.83,
          "FINNPOW": 0.83,
          "MECOS3": 0.83,
          "PIVATIC1": 0.84,
          "PIVATIC2": 0.84,
          "PIVATIC4": 0.86,
          "PIVATIC5": 0.86,
          "RASTER": 0.83,
          "SAFAN3": 0.83,
          "SAFAN4": 0.83,
          "SAFAN5": 0.83,
          "SAFAN6": 0.83,
          "SAFAN7": 0.85,
          "SAFAN8": 0.83,
          "SAFAN10": 0.86
        }
      }
    ],
    "KE1": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.64,
          "2DIMECO": 0.84,
          "PIVATIC1": 0.84,
          "RASTER": 0.83,
          "SAFAN6": 0.83,
          "SAFAN7": 0.85,
          "SAFAN8": 0.83
        }
      }
    ],
    "KE2": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.86
        }
      }
    ],
    "KE3": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.8,
          "RASTER": 0.83,
          "SAFAN6": 0.83,
          "SAFAN7": 0.85,
          "SAFAN8": 0.83
        }
      }
    ],
    "KE4": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.8
        }
      }
    ],
    "KE5": [
      {
        "qty": 0,
        "wcs": {
          "*": 1,
          "AMAD2": 0.98,
          "AMADA3": 0.83,
          "FINNPOW": 0.83,
          "INLED1": 0.63,
          "PIVATIC2": 0.84,
          "PIVATIC5": 0.86,
          "SAFAN5": 0.83
        }
      }
    ],
    "KE6": [
      {
        "qty": 0,
        "wcs": {
          "*": 1,
          "ARC34912": 0.87,
          "PIVATIC2": 0.84,
          "PIVATIC4": 0.86,
          "SAFAN5": 0.83,
          "SAFAN6": 0.83,
          "T2LED": 0.7
        }
      }
    ],
    "KE8": [
      {
        "qty": 0,
        "wcs": {
          "*": 1,
          "5DIMECO": 0.8,
          "RC34912": 0.99,
          "T2LED": 0.82
        }
      }
    ],
    "KEA": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.9
        }
      }
    ],
    "KEE": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.59,
          "2DIMECO": 0.84,
          "PIVATIC1": 0.84,
          "RASTER": 0.83,
          "SAFAN6": 0.83,
          "SAFAN7": 0.85,
          "SAFAN8": 0.83
        }
      }
    ],
    "KF1": [
      {
        "qty": 0,
        "wcs": {
          "*": 1,
          "AMAD2": 0.98,
          "AMADA3": 0.83,
          "FINNPOW": 0.83,
          "PIVATIC2": 0.84,
          "PIVATIC5": 0.86,
          "RC340": 0.59,
          "SAFAN5": 0.83
        }
      }
    ],
    "KF2": [
      {
        "qty": 0,
        "wcs": {
          "*": 1,
          "AMAD2": 0.98,
          "AMADA3": 0.83,
          "FINNPOW": 0.83,
          "PIVATIC2": 0.84,
          "PIVATIC5": 0.86,
          "SAFAN5": 0.83,
          "SM340": 0.83
        }
      }
    ],
    "KF3": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.8
        }
      }
    ],
    "KF6": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.82
        }
      }
    ],
    "KF9": [
      {
        "qty": 0,
        "wcs": {
          "*": 1,
          "MECOS3": 0.83,
          "PIVATIC4": 0.86,
          "WATER3": 0.75
        }
      }
    ],
    "KFB": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.9
        }
      }
    ],
    "KFC": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.59,
          "2DIMECO": 0.84,
          "PIVATIC1": 0.84,
          "RASTER": 0.83,
          "SAFAN6": 0.83,
          "SAFAN7": 0.85,
          "SAFAN8": 0.83
        }
      }
    ],
    "KFD": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.59,
          "2DIMECO": 0.84,
          "PIVATIC1": 0.84,
          "RASTER": 0.83,
          "SAFAN6": 0.83,
          "SAFAN7": 0.85,
          "SAFAN8": 0.83
        }
      }
    ],
    "KG1": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.62,
          "2DIMECO": 0.84,
          "PIVATIC1": 0.84,
          "RASTER": 0.83,
          "SAFAN6": 0.83,
          "SAFAN7": 0.85,
          "SAFAN8": 0.83
        }
      }
    ],
    "KG5": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.9
        }
      }
    ],
    "KG6": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.82,
          "RASTER": 0.83,
          "SAFAN6": 0.83,
          "SAFAN7": 0.85,
          "SAFAN8": 0.83
        }
      }
    ],
    "KG8": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.9
        }
      }
    ],
    "KG9": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.8
        }
      }
    ],
    "KGA": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.59,
          "2DIMECO": 0.84,
          "PIVATIC1": 0.84,
          "RASTER": 0.83,
          "SAFAN6": 0.83,
          "SAFAN7": 0.85,
          "SAFAN8": 0.83
        }
      }
    ],
    "KGB": [
      {
        "qty": 0,
        "wcs": {
          "*": 1,
          "4DIMECO": 0.83,
          "ARC34912": 0.99,
          "MAXOS": 0.44,
          "MAXOSNZP": 0.44
        }
      }
    ],
    "KGC": [
      {
        "qty": 0,
        "wcs": {
          "*": 1,
          "5DIMECO": 0.8,
          "LL500X": 0.6
        }
      }
    ],
    "KGD": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.59,
          "2DIMECO": 0.84,
          "PIVATIC1": 0.84,
          "RASTER": 0.83,
          "SAFAN6": 0.83,
          "SAFAN7": 0.85,
          "SAFAN8": 0.83
        }
      }
    ],
    "KGE": [
      {
        "qty": 0,
        "wcs": {
          "*": 1,
          "OUTD15": 0.82
        }
      }
    ],
    "KH1": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.85
        }
      }
    ],
    "KH2": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.88
        }
      }
    ],
    "KH3": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.78
        }
      }
    ],
    "KH4": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.88
        }
      }
    ],
    "KH5": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.85
        }
      }
    ],
    "KH9": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.92
        }
      }
    ],
    "KHA": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.92
        }
      }
    ],
    "KHC": [
      {
        "qty": 0,
        "wcs": {
          "*": 1,
          "ARC34912": 0.87,
          "LL500T": 0.81
        }
      }
    ],
    "KHJ": [
      {
        "qty": 0,
        "wcs": {
          "*": 0.78
        }
      }
    ],
    "KSC": [
      {
        "qty": 0,
        "wcs": {
          "*": 1,
          "MAXOSNZP": 0.58
        }
      }
    ]
  }
}});
