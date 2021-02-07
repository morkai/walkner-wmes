/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var TRANSLITERATION_MAP = {
  'Ę': 'E', 'ę': 'e',
  'Ó': 'O', 'ó': 'o',
  'Ą': 'A', 'ą': 'a',
  'Ś': 'S', 'ś': 's',
  'Ł': 'L', 'ł': 'l',
  'Ż': 'Z', 'ż': 'z',
  'Ź': 'Z', 'ź': 'z',
  'Ć': 'C', 'ć': 'c',
  'Ń': 'N', 'ń': 'n'
};
var TRANSLITERATION_RE = new RegExp(Object.keys(TRANSLITERATION_MAP).join('|'), 'g');

function transliterate(value)
{
  return String(value).replace(TRANSLITERATION_RE, function(m) { return TRANSLITERATION_MAP[m]; });
}

function transliterateFileName(name)
{
  return transliterate(name)
    .replace(/[^a-zA-Z0-9_\-.]+/g, '_')
    .replace(/_+/g, '_');
}


const descToKind = {
  scan: 'other',
  before: 'before',
  after: 'after'
};

db.suggestions.find({}).forEach(s =>
{
  const changes = {
    scan: null,
    before: null,
    after: null
  };

  s.changes.forEach(c =>
  {
    if (!c.data.attachments)
    {
      return;
    }

    const data = [null, {added: [], edited: [], deleted: []}];
    const old = {};

    c.data.attachments[0].forEach(a =>
    {
      a.date = null;
      a.user = null;
      a.file = transliterateFileName(a.name);
      a.kind = descToKind[a.description];
      a.meta = {};

      delete a.path;
      delete a.description;

      changes[a.description] = a;

      old[a._id] = a;
    });

    c.data.attachments[1].forEach(a =>
    {
      a.date = c.date;
      a.user = c.user;
      a.file = transliterateFileName(a.name);
      a.kind = descToKind[a.description];
      a.meta = {};

      delete a.path;
      delete a.description;

      changes[a.description] = a;

      if (old[a._id])
      {
        data[1].edited.push({
          ...a,
          old: old[a._id]
        });

        delete old[a._id];
      }
      else
      {
        data[1].added.push(a);
      }
    });

    Object.values(old).forEach(a => data[1].deleted.push(a));

    c.data.attachments = data;
  });

  s.attachments.forEach(a =>
  {
    const c = changes[a.description];

    if (c)
    {
      a.date = c.date;
      a.user = c.user;
    }
    else
    {
      a.date = s.createdAt;
      a.user = s.creator;
    }

    a.file = transliterateFileName(a.name);
    a.kind = descToKind[a.description];
    a.meta = {};

    delete a.path;
    delete a.description;
  });

  db.suggestions.updateOne({_id: s._id}, {$set: {
    attachments: s.attachments,
    changes: s.changes
  }});
});
