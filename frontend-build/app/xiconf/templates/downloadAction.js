define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="btn-group">\n  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">\n    <i class="fa fa-download"></i><span>'),__append(helpers.t("PAGE_ACTION:download")),__append('</span> <span class="caret"></span>\n  </button>\n  <ul class="dropdown-menu pull-right">\n    '),Object.keys(files).forEach(function(n){__append('\n    <li class="'),__append(files[n]?"":"disabled"),__append('"><a '),__append(files[n]?'href="'+files[n]+'"':""),__append(">"),__append(helpers.t("PAGE_ACTION:download:"+n)),__append("</a></li>\n    ")}),__append("\n  </ul>\n</div>\n");return __output.join("")}});