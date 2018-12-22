/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.fapcategories.deleteMany({});
db.fapentries.updateMany({subdivisions: {$exists: false}}, {$set: {subdivisions: []}});

db.fapentries.find({}).forEach(entry =>
{
  if (entry.solutionSteps !== undefined)
  {
    return;
  }

  db.fapentries.updateOne({_id: entry._id}, {$set: {
    solution: '',
    solutionSteps: entry.solution
  }});
});

db.opinionsurveys.updateMany({company: {$exists: false}}, {
  $set: {
    company: 'Philips Lighting Poland Sp. z o.o.',
    employer: 'Jestem pracownikiem:',
    superior: 'Mój przełożony to:',
    showDivision: true,
    lang: {}
  }
});

db.delayreasons.updateMany({requireComponent: {$exists: false}}, {$set: {requireComponent: false}});

try
{
  db.divisions.insertMany(getDivisions(), {ordered: false});
}
catch (err) {}

try
{
  db.subdivisions.insertMany(getSubdivisions(), {ordered: false});
}
catch (err) {}

try
{
  db.fapcategories.insertMany(getFapCategories(), {ordered: false});
}
catch (err) {}

function getDivisions()
{
  return [{
    "_id": "Wsparcie",
    "type": "other",
    "description": "Wsparcie Produkcji",
    "deactivatedAt": null,
    "__v": 0
  }];
}

function getSubdivisions()
{
  return [
    {
      "_id": new ObjectId("5c11f252f992802d4647cb05"),
      "type": "other",
      "prodTaskTags": [],
      "aor": null,
      "deactivatedAt": null,
      "division": "Wsparcie",
      "name": "ETO",
      "autoDowntimes": [],
      "__v": 0
    },
    {
      "_id": new ObjectId("5c168ad51f1a7d2ee3fcd340"),
      "type": "other",
      "prodTaskTags": [],
      "aor": null,
      "deactivatedAt": null,
      "division": "Wsparcie",
      "name": "IT",
      "autoDowntimes": [],
      "__v": 0
    },
    {
      "_id": new ObjectId("5c11f28cf992802d4647cb07"),
      "type": "other",
      "prodTaskTags": [],
      "aor": null,
      "deactivatedAt": null,
      "division": "Wsparcie",
      "name": "Inżynieria Jakości",
      "autoDowntimes": [],
      "__v": 0
    },
    {
      "_id": new ObjectId("5c10aaa0ccd2c12b037528ef"),
      "type": "storage",
      "prodTaskTags": ["(FTE) magazyn komponentów"],
      "aor": new ObjectId("5283530e7296be8672a28bd5"),
      "deactivatedAt": null,
      "division": "LD",
      "name": "Magazyn komponentów - Obsługa produkcji",
      "autoDowntimes": [],
      "__v": 0
    },
    {
      "_id": new ObjectId("5c10ab02ccd2c12b037528f1"),
      "type": "storage",
      "prodTaskTags": ["(FTE) magazyn komponentów"],
      "aor": new ObjectId("5283530e7296be8672a28bd5"),
      "deactivatedAt": null,
      "division": "LD",
      "name": "Magazyn komponentów - Przyjęcia dostaw",
      "autoDowntimes": [],
      "__v": 0
    }
  ];
}

function getFapCategories()
{
  return [
    {
      "_id": "5544b90b2b5949f80d80b365",
      "name": "Awaria maszyny, linii, wyposażenia",
      "__v": 8,
      "active": true,
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "process-engineer",
            "leader",
            "master"
          ]
        },
        {
          "subdivisions": [
            "535f38cb277768841348a31c"
          ],
          "prodFunctions": [
            "master",
            "manager"
          ]
        }
      ],
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5544b9182b5949f80d80b369",
      "name": "Awarie infrastruktury/sieci IT",
      "__v": 4,
      "active": true,
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f2685cd8eea9824000018",
            "529f266ccd8eea9824000014"
          ],
          "prodFunctions": [
            "process-engineer",
            "master",
            "leader",
            "manager"
          ]
        },
        {
          "subdivisions": [
            "535f38cb277768841348a31c"
          ],
          "prodFunctions": [
            "master"
          ]
        }
      ],
      "users": [
        {
          "id": "5298cfcf362a3f001f000dcf",
          "label": "Walukiewicz Zbigniew (46008076)"
        }
      ],
      "subdivisions": []
    },
    {
      "_id": "5544b9552b5949f80d80b383",
      "name": "Brak komponentu",
      "__v": 4,
      "active": true,
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "manager",
            "process-engineer",
            "leader",
            "master",
            "production-planner"
          ]
        },
        {
          "subdivisions": [
            "529f2629cd8eea982400000c"
          ],
          "prodFunctions": [
            "prod_whman",
            "in_whman",
            "whman",
            "master"
          ]
        }
      ],
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5544b94d2b5949f80d80b37d",
      "name": "Błąd Inżynierii procesu",
      "__v": 2,
      "active": true,
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "process-engineer",
            "leader",
            "manager",
            "master"
          ]
        }
      ],
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5c124e581f1a7d2ee3fcd338",
      "active": true,
      "name": "Błąd Operatora",
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "master",
            "leader",
            "process-engineer",
            "manager"
          ]
        },
        {
          "subdivisions": [
            "5c11f28cf992802d4647cb07"
          ],
          "prodFunctions": [
            "quality_engineer"
          ]
        }
      ],
      "__v": 3,
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5c134f241f1a7d2ee3fcd33c",
      "active": true,
      "name": "Błąd konstrukcyjny ETO",
      "notifications": [
        {
          "subdivisions": [
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018",
            "529f264acd8eea9824000010"
          ],
          "prodFunctions": [
            "designer_eto",
            "process-engineer",
            "master",
            "manager",
            "leader"
          ]
        }
      ],
      "__v": 0,
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5544b9422b5949f80d80b379",
      "name": "Błąd konstrukcyjny FD",
      "__v": 3,
      "active": true,
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "designer",
            "process-engineer",
            "master",
            "leader",
            "manager"
          ]
        }
      ],
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5c124ebb1f1a7d2ee3fcd339",
      "active": true,
      "name": "Błąd w planowaniu",
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "master",
            "leader",
            "process-engineer",
            "production-planner"
          ]
        }
      ],
      "__v": 0,
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5c134ed71f1a7d2ee3fcd33b",
      "active": true,
      "name": "IPT - TEST",
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "process-engineer",
            "designer",
            "manager",
            "leader",
            "master"
          ]
        }
      ],
      "__v": 0,
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5bcdce0a46f003084ca86611",
      "active": true,
      "name": "IPT - TEST (ETO)",
      "__v": 4,
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "process-engineer",
            "leader",
            "master",
            "manager"
          ]
        },
        {
          "subdivisions": [
            "5c11f252f992802d4647cb05"
          ],
          "prodFunctions": [
            "designer_eto"
          ]
        }
      ],
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5544b95a2b5949f80d80b387",
      "name": "Inne",
      "__v": 1,
      "active": true,
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f2685cd8eea9824000018",
            "529f266ccd8eea9824000014"
          ],
          "prodFunctions": [
            "manager",
            "process-engineer",
            "leader",
            "master"
          ]
        }
      ],
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5544b95c2b5949f80d80b389",
      "name": "MES",
      "__v": 2,
      "active": true,
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "process-engineer",
            "leader",
            "manager",
            "master"
          ]
        }
      ],
      "users": [
        {
          "id": "5a9ad496774e0117984ede14",
          "label": "Kisiel Michał (46218606)"
        },
        {
          "id": "583849c0e46f3a12bc9e5103",
          "label": "Walukiewicz ŁUKASZ (41)"
        }
      ],
      "subdivisions": []
    },
    {
      "_id": "5bcdce2146f003084ca86615",
      "active": true,
      "name": "Niezgodność BOM",
      "__v": 2,
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "manager",
            "leader",
            "master",
            "process-engineer",
            "designer",
            "production-planner"
          ]
        },
        {
          "subdivisions": [
            "5c11f252f992802d4647cb05"
          ],
          "prodFunctions": [
            "designer_eto"
          ]
        }
      ],
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5bcdce3746f003084ca86619",
      "active": true,
      "name": "Pilot ETO / seria próbna",
      "__v": 2,
      "notifications": [
        {
          "subdivisions": [
            "529f266ccd8eea9824000014",
            "529f264acd8eea9824000010",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "process-engineer",
            "designer_eto",
            "master",
            "manager",
            "leader"
          ]
        },
        {
          "subdivisions": [
            "5c11f28cf992802d4647cb07"
          ],
          "prodFunctions": [
            "quality_engineer"
          ]
        }
      ],
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5544b9402b5949f80d80b377",
      "name": "Problem Jakościowy",
      "__v": 3,
      "active": true,
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "process-engineer",
            "manager",
            "leader",
            "master"
          ]
        },
        {
          "subdivisions": [
            "5c11f28cf992802d4647cb07"
          ],
          "prodFunctions": [
            "quality_engineer"
          ]
        }
      ],
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5544b9572b5949f80d80b385",
      "name": "SAP - Błędne dane",
      "__v": 2,
      "active": true,
      "notifications": [
        {
          "subdivisions": [
            "529f264acd8eea9824000010",
            "529f266ccd8eea9824000014",
            "529f2685cd8eea9824000018"
          ],
          "prodFunctions": [
            "process-engineer",
            "master",
            "leader",
            "manager"
          ]
        }
      ],
      "users": [],
      "subdivisions": []
    },
    {
      "_id": "5c19b012a5001347fbeb6c16",
      "users": [
        {
          "id": "583849c0e46f3a12bc9e5103",
          "label": "Walukiewicz ŁUKASZ (41)"
        },
        {
          "id": "5298cfcf362a3f001f000dde",
          "label": "Walukiewicz Szymon (46007299)"
        },
        {
          "id": "5a9ad496774e0117984ede14",
          "label": "Kisiel Michał (46218606)"
        }
      ],
      "active": true,
      "name": "Test",
      "notifications": [
        {
          "subdivisions": [
            "589aea9c1f4fe02710059e34"
          ],
          "prodFunctions": [
            "operator"
          ]
        }
      ],
      "__v": 0,
      "subdivisions": []
    }
  ].map(c =>
  {
    delete c.subdivisions;

    c._id = new ObjectId(c._id);

    return c;
  });
}
