// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  var mimeToExt = {
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'application/json': 'json',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'video/mp4': 'mp4'
  };
  var extToIcon = {
    default: 'fa-file-o',
    '7z': 'fa-file-archive-o',
    zip: 'fa-file-archive-o',
    rar: 'fa-file-archive-o',
    mp3: 'fa-file-audio-o',
    wav: 'fa-file-audio-o',
    flac: 'fa-file-audio-o',
    json: 'fa-file-code-o',
    jpg: 'fa-file-image-o',
    gif: 'fa-file-image-o',
    png: 'fa-file-image-o',
    webp: 'fa-file-image-o',
    xlsx: 'fa-file-excel-o',
    mp4: 'fa-file-movie-o',
    pdf: 'fa-file-pdf-o',
    pptx: 'fa-file-powerpoint-o',
    txt: 'fa-file-text-o',
    docx: 'fa-file-word-o'
  };

  return {
    getByExt: function(ext)
    {
      return extToIcon[ext] || extToIcon.default;
    },
    getByMime: function(mime)
    {
      return this.getByExt(mimeToExt[mime]);
    }
  };
});
