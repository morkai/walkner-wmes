// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery"],function(n){"use strict";var e=null;return n(document).on("copy",function(n){null!==e&&(n.preventDefault(),e(n.originalEvent.clipboardData),e=null)}),{copy:function(n){e=n,document.execCommand("copy")}}});