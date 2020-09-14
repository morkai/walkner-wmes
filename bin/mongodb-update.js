/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.kaizenproductfamilies.updateMany({active: {$exists: false}}, {$set: {active: true}});
db.kaizenproductfamilies.updateMany({mrps: {$exists: false}}, {$set: {mrps: []}});

db.kaizencategories.updateMany({coordSections: {$exists: false}}, {$set: {coordSections: []}});

db.kaizensections.find({'coordinators._id': {$exists: true}}).forEach(s =>
{
  s.coordinators.forEach(u => delete u._id);

  db.kaizensections.updateOne({_id: s._id}, {$set: {coordinators: s.coordinators}});
});

db.kaizensections.find({'confirmers._id': {$exists: true}}).forEach(s =>
{
  s.confirmers.forEach(u => delete u._id);

  db.kaizensections.updateOne({_id: s._id}, {$set: {confirmers: s.confirmers}});
});

db.suggestions.find({'coordSections.0': {$exists: true}}).forEach(s =>
{
  s.coordSections.forEach(section =>
  {
    if (!section.users)
    {
      section.users = [];
    }
  });

  db.suggestions.updateOne({_id: s._id}, {$set: {coordSections: s.coordSections}});
});

db.kaizenproductfamilies.deleteMany({});
db.kaizenproductfamilies.insertMany([
  /* 1 */
  {
    "_id" : "WT460",
    "name" : "WT460 - Pacific",
    "owners" : [ ],
    "position" : 13,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KF9"
    ]
  },

  /* 2 */
  {
    "_id" : "US2",
    "position" : 2,
    "owners" : [ ],
    "name" : "UniStreet Gen 2",
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KF3"
    ]
  },

  /* 3 */
  {
    "_id" : "TG",
    "name" : "Town Guide",
    "owners" : [ ],
    "position" : 5,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KH3"
    ]
  },

  /* 4 */
  {
    "_id" : "TBS415",
    "name" : "TBS415",
    "owners" : [ ],
    "position" : 8,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KE9"
    ]
  },

  /* 5 */
  {
    "_id" : "TBS411",
    "name" : "TBS411",
    "owners" : [ ],
    "position" : 7,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KE9"
    ]
  },

  /* 6 */
  {
    "_id" : "SSTAR",
    "position" : 90,
    "active" : true,
    "owners" : [ ],
    "mrps" : [
      "KG2"
    ],
    "name" : "Speedstar (BGP321)",
    "__v" : 0
  },

  /* 7 */
  {
    "_id" : "SNF111",
    "name" : "SNF111 – Comfort Vision",
    "owners" : [ ],
    "position" : 19,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KH5"
    ]
  },

  /* 8 */
  {
    "_id" : "PS",
    "name" : "PetrolStation",
    "owners" : [ ],
    "position" : 13,
    "__v" : 0,
    "active" : false,
    "mrps" : [ ]
  },

  /* 9 */
  {
    "_id" : "OTHER",
    "position" : 999999,
    "owners" : [ ],
    "name" : "Inna",
    "__v" : 0,
    "active" : true,
    "mrps" : [ ]
  },

  /* 10 */
  {
    "_id" : "OR",
    "name" : "Oprawy rastrowe (KE1, KE4)",
    "owners" : [ ],
    "position" : 12,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KE1",
      "KE4"
    ]
  },

  /* 11 */
  {
    "_id" : "MVP507",
    "name" : "MVP507 – Opti Vision",
    "owners" : [ ],
    "position" : 18,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KH1"
    ]
  },

  /* 12 */
  {
    "_id" : "MVP506",
    "name" : "MVP506 i BVP506 – Optiflood",
    "owners" : [ ],
    "position" : 15,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KH5"
    ]
  },

  /* 13 */
  {
    "_id" : "MVP504",
    "name" : "MVP504 – Mini Optiflood",
    "owners" : [ ],
    "position" : 14,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KH5"
    ]
  },

  /* 14 */
  {
    "_id" : "MVF403",
    "name" : "MVF403 – Arena Vision",
    "owners" : [ ],
    "position" : 16,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KH1"
    ]
  },

  /* 15 */
  {
    "_id" : "MVF024",
    "name" : "MVF024 – Power Vision",
    "owners" : [ ],
    "position" : 17,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KH1"
    ]
  },

  /* 16 */
  {
    "_id" : "MLUMA",
    "position" : 130,
    "active" : true,
    "owners" : [ ],
    "mrps" : [
      "KHA"
    ],
    "name" : "Mini Luma",
    "__v" : 0
  },

  /* 17 */
  {
    "_id" : "ML",
    "name" : "Micro Luma",
    "owners" : [ ],
    "position" : 4,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KH9"
    ]
  },

  /* 18 */
  {
    "_id" : "MET",
    "name" : "Metronomis",
    "owners" : [ ],
    "position" : 6,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KH3"
    ]
  },

  /* 19 */
  {
    "_id" : "MAXOSIT",
    "position" : 140,
    "active" : true,
    "owners" : [ ],
    "mrps" : [
      "KGB"
    ],
    "name" : "Maxos Industry Trunking",
    "__v" : 0
  },

  /* 20 */
  {
    "_id" : "MAXOSFT",
    "position" : 160,
    "active" : true,
    "owners" : [ ],
    "mrps" : [
      "KHC"
    ],
    "name" : "Maxos Fusion Trunking",
    "__v" : 0
  },

  /* 21 */
  {
    "_id" : "MAXOSFP",
    "position" : 150,
    "active" : true,
    "owners" : [ ],
    "mrps" : [
      "KGC"
    ],
    "name" : "Maxos Fusion Panel",
    "__v" : 0
  },

  /* 22 */
  {
    "_id" : "MAL",
    "position" : 24,
    "owners" : [ ],
    "name" : "Malaga LED",
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KE4"
    ]
  },

  /* 23 */
  {
    "_id" : "M300L3",
    "position" : 100,
    "active" : true,
    "owners" : [ ],
    "mrps" : [
      "KE2"
    ],
    "name" : "Mini300 LED gen3",
    "__v" : 0
  },

  /* 24 */
  {
    "_id" : "LUMA2",
    "position" : 120,
    "active" : true,
    "owners" : [ ],
    "mrps" : [
      "KGE"
    ],
    "name" : "Luma gen2",
    "__v" : 0
  },

  /* 25 */
  {
    "_id" : "LINECO",
    "position" : 60,
    "active" : true,
    "owners" : [ ],
    "mrps" : [
      "KE3"
    ],
    "name" : "Lineco: TMS022, GMS022, ZMS022, BMS022",
    "__v" : 0
  },

  /* 26 */
  {
    "_id" : "LIBRA",
    "position" : 110,
    "active" : true,
    "owners" : [ ],
    "mrps" : [
      "KF7"
    ],
    "name" : "Libra LED/HID",
    "__v" : 0
  },

  /* 27 */
  {
    "_id" : "LER",
    "name" : "Ler - Uni, Lumi Street",
    "owners" : [ ],
    "position" : 3,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KF6"
    ]
  },

  /* 28 */
  {
    "_id" : "IR3",
    "name" : "Iridium 3",
    "owners" : [ ],
    "position" : 10,
    "__v" : 3,
    "active" : true,
    "mrps" : [
      "KH4"
    ]
  },

  /* 29 */
  {
    "_id" : "IR2",
    "name" : "Iridium 2",
    "owners" : [ ],
    "position" : 44,
    "__v" : 4,
    "active" : true,
    "mrps" : [
      "KG6"
    ]
  },

  /* 30 */
  {
    "_id" : "IR1",
    "name" : "Iridium 1",
    "owners" : [ ],
    "position" : 2,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KG5"
    ]
  },

  /* 31 */
  {
    "_id" : "IM",
    "name" : "Iridium/Modena",
    "owners" : [ ],
    "position" : 30,
    "__v" : 3,
    "active" : true,
    "mrps" : [
      "KG5"
    ]
  },

  /* 32 */
  {
    "_id" : "GS",
    "name" : "Gentle Space",
    "owners" : [ ],
    "position" : 11,
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KG8"
    ]
  },

  /* 33 */
  {
    "_id" : "FS",
    "position" : 70,
    "active" : true,
    "owners" : [ ],
    "mrps" : [
      "KE7"
    ],
    "name" : "FreeStreet, MAXOS LED",
    "__v" : 0
  },

  /* 34 */
  {
    "_id" : "FBSS",
    "position" : 140,
    "active" : true,
    "owners" : [ ],
    "mrps" : [
      "KF2"
    ],
    "name" : "Flexblend S&S",
    "__v" : 0
  },

  /* 35 */
  {
    "_id" : "EPCGS",
    "position" : 80,
    "active" : true,
    "owners" : [ ],
    "mrps" : [
      "KG1"
    ],
    "name" : "EPC300, EGS350",
    "__v" : 0
  },

  /* 36 */
  {
    "_id" : "DIGI",
    "position" : 50,
    "owners" : [ ],
    "name" : "DigiStreet",
    "__v" : 2,
    "active" : true,
    "mrps" : [
      "KG9"
    ]
  },

  /* 37 */
  {
    "_id" : "CW",
    "name" : "Clear Way",
    "owners" : [ ],
    "position" : 22,
    "__v" : 0,
    "active" : false,
    "mrps" : [ ]
  },

  /* 38 */
  {
    "_id" : "CT",
    "name" : "Coreline Trunking",
    "owners" : [ ],
    "position" : 20,
    "__v" : 3,
    "active" : true,
    "mrps" : [
      "KE6"
    ]
  },

  /* 39 */
  {
    "_id" : "CO",
    "name" : "Coreline Office",
    "owners" : [ ],
    "position" : 1,
    "__v" : 2,
    "active" : true,
    "mrps" : [
      "KE5"
    ]
  },

  /* 40 */
  {
    "_id" : "CLW2",
    "position" : 23,
    "owners" : [ ],
    "name" : "Clear Way Gen 2",
    "__v" : 1,
    "active" : true,
    "mrps" : [
      "KHJ"
    ]
  }
]);

db.kaizencategories.deleteMany({});
db.kaizencategories.insertMany([
  /* 1 */
  {
    "_id" : "na",
    "name" : "n/a",
    "position" : 6,
    "inSuggestion" : false,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 0,
    "active" : true,
    "coordSections" : [ ]
  },

  /* 2 */
  {
    "_id" : "ZZ",
    "name" : "Zbędny zapasy",
    "position" : 30,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 1,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [
          "process-engineer"
        ],
        "section" : "LT",
        "mor" : "mrp"
      }
    ]
  },

  /* 3 */
  {
    "_id" : "ZT",
    "name" : "Zbędny transport",
    "position" : 20,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 1,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [
          "process-engineer"
        ],
        "section" : "LT",
        "mor" : "mrp"
      }
    ]
  },

  /* 4 */
  {
    "_id" : "ZR",
    "name" : "Zbędny ruch",
    "position" : 40,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 1,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [
          "process-engineer"
        ],
        "section" : "LT",
        "mor" : "mrp"
      }
    ]
  },

  /* 5 */
  {
    "_id" : "ZP",
    "name" : "Zbędne przetwarzanie",
    "position" : 70,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 1,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [
          "process-engineer"
        ],
        "section" : "LT",
        "mor" : "mrp"
      }
    ]
  },

  /* 6 */
  {
    "_id" : "U",
    "name" : "Umiejętności",
    "position" : 80,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 0,
    "active" : true,
    "coordSections" : [ ]
  },

  /* 7 */
  {
    "_id" : "SYS",
    "name" : "Systematyka",
    "position" : 100,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 1,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [
          "process-engineer"
        ],
        "section" : "LT",
        "mor" : "mrp"
      }
    ]
  },

  /* 8 */
  {
    "_id" : "STD",
    "name" : "Standaryzacja",
    "position" : 120,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 1,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [
          "process-engineer"
        ],
        "section" : "LT",
        "mor" : "mrp"
      }
    ]
  },

  /* 9 */
  {
    "_id" : "SS",
    "name" : "Selekcja, sortowanie",
    "position" : 90,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 1,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [
          "process-engineer"
        ],
        "section" : "LT",
        "mor" : "mrp"
      }
    ]
  },

  /* 10 */
  {
    "_id" : "SPRZ",
    "name" : "Sprzątanie",
    "position" : 110,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 1,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [
          "process-engineer"
        ],
        "section" : "LT",
        "mor" : "mrp"
      }
    ]
  },

  /* 11 */
  {
    "_id" : "SO",
    "description" : "Zachowanie, którego skutkiem jest nieprawidłowa segregacja odpadów (np. w pojemnikach na tworzywo znajduje się odpad makulatury)",
    "inNearMiss" : true,
    "inSuggestion" : false,
    "position" : 3,
    "name" : "Segregacja odpadów",
    "__v" : 0,
    "active" : true,
    "coordSections" : [ ]
  },

  /* 12 */
  {
    "_id" : "OTHER",
    "name" : "inna",
    "inSuggestion" : false,
    "inNearMiss" : true,
    "description" : "",
    "__v" : 0,
    "position" : 5,
    "active" : true,
    "coordSections" : [ ]
  },

  /* 13 */
  {
    "_id" : "OPL",
    "name" : "One Point Lesson",
    "position" : 1,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "One Point Lesson – Lekcja Jednostronicowa. Dzielimy się wiedzą o zdarzeniu, usprawnieniu, działaniu procesu.",
    "__v" : 0,
    "active" : true,
    "coordSections" : [ ]
  },

  /* 14 */
  {
    "_id" : "OCZ",
    "name" : "Oczekiwanie",
    "position" : 50,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 1,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [
          "process-engineer"
        ],
        "section" : "LT",
        "mor" : "mrp"
      }
    ]
  },

  /* 15 */
  {
    "_id" : "NZ",
    "name" : "Ryzykowne zachowanie",
    "inSuggestion" : false,
    "inNearMiss" : true,
    "description" : "Zachowanie, którego skutkiem może być wypadek/choroba (np.: nie stosowanie środków ochrony indywidualnej (np. okularów, rękawic), niestosowanie wymaganych narzędzi/sprzętu, niewłaściwe posługiwanie się nimi, nie przestrzeganie procedur, instrukcji, standardów (np 6S), wkładanie rąk w strefę zagrożenia, wejście w strefę niedozwoloną, wykonywanie czynności bez usunięcia zagrożenia (np. niewyłączenie maszyny, niewyłączenie napięcia), zbyt szybka jazda, pozostawienie przedmiotów pracy w niewłaściwym miejscu, nieergonomiczna pozycja przy pracy).",
    "__v" : 0,
    "position" : 4,
    "active" : true,
    "coordSections" : [ ]
  },

  /* 16 */
  {
    "_id" : "NSI",
    "name" : "Niewłaściwy stan infrastruktury",
    "inSuggestion" : false,
    "inNearMiss" : true,
    "description" : "Zły stan infrastruktury, którego skutkiem może być wypadek/choroba (np.: niesprawne urządzenia, uszkodzone/zużyte wyposażenie stanowiska pracy, uszkodzona konstrukcja stanowiska, brak lub niewłaściwe urządzenia zabezpieczające (np. osłony), niebezpieczne przedmioty, wycieki oleju, uszkodzone regały, uszkodzone wózki, emisja pyłu (zapylenie) lub czynników chemicznych, silny hałas, drgania).",
    "__v" : 0,
    "position" : 2,
    "active" : true,
    "coordSections" : [ ]
  },

  /* 17 */
  {
    "_id" : "NP",
    "name" : "Nadprodukcja",
    "position" : 60,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 1,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [
          "process-engineer"
        ],
        "section" : "LT",
        "mor" : "mrp"
      }
    ]
  },

  /* 18 */
  {
    "_id" : "NOP",
    "name" : "Niewłaściwa organizacja pracy",
    "inSuggestion" : false,
    "inNearMiss" : true,
    "description" : "Stan, w wyniku którego może dojść do wypadku/choroby (np.: ustawienie urządzeń, przedmiotów, wyposażenia utrudniające poruszanie się, brak lub niewłaściwe oznakowanie miejsc niebezpiecznych, praca na wysokości bez zabezpieczeń, ostre krawędzie, brak instrukcji bhp, brak szkolenia bhp, nieodpowiednie rozmieszczenie i składowanie przedmiotów, nadmierny ciężar).",
    "__v" : 0,
    "position" : 3,
    "active" : true,
    "coordSections" : [ ]
  },

  /* 19 */
  {
    "_id" : "KON",
    "name" : "Konstrukcja",
    "position" : 150,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 1,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [
          "designer"
        ],
        "section" : "MD",
        "mor" : "mrp"
      }
    ]
  },

  /* 20 */
  {
    "_id" : "KI",
    "description" : "",
    "inNearMiss" : false,
    "inSuggestion" : true,
    "position" : 160,
    "name" : "Kaizen Event",
    "__v" : 0,
    "active" : true,
    "coordSections" : [ ]
  },

  /* 21 */
  {
    "_id" : "IBU",
    "name" : "Incydent bez urazu",
    "inSuggestion" : false,
    "inNearMiss" : true,
    "description" : "Zdarzenie nagłe wywołane przyczyną zewnętrzną mające związek z pracą (np.: upadek przedmiotu z wysokości w bezpośrednim sąsiedztwie osób, kolizja z udziałem pojazdów, potknięcie się o przedmioty leżące na drodze, poślizgnięcie się, zaczepienie o wystający przedmiot, uderzenie o lub przez przedmioty).",
    "__v" : 0,
    "position" : 5,
    "active" : true,
    "coordSections" : [ ]
  },

  /* 22 */
  {
    "_id" : "DYS",
    "name" : "Samodyscyplina",
    "position" : 130,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 1,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [
          "process-engineer"
        ],
        "section" : "LT",
        "mor" : "mrp"
      }
    ]
  },

  /* 23 */
  {
    "_id" : "BHP",
    "name" : "BHP+ergonomia",
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 6,
    "position" : 10,
    "active" : true,
    "coordSections" : [
      {
        "funcs" : [ ],
        "section" : "KBHP",
        "mor" : "none"
      }
    ]
  },

  /* 24 */
  {
    "_id" : "AM",
    "name" : "Autonomous Maintenance",
    "position" : 140,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "",
    "__v" : 0,
    "active" : true,
    "coordSections" : [ ]
  },

  /* 25 */
  {
    "_id" : "A3",
    "name" : "A3",
    "position" : 22,
    "inSuggestion" : true,
    "inNearMiss" : false,
    "description" : "A3",
    "__v" : 0,
    "active" : true,
    "coordSections" : [ ]
  }
]);
