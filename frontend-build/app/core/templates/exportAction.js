define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})1===formats.length?(__append('\n<a class="page-actions-export btn btn-'),__append(type),__append(" "),__append(disabled?"disabled":""),__append('" href="'),__append(escapeFn(formats[0].href)),__append('"><i class="fa fa-download"></i><span>'),__append(label),__append("</span></a>\n")):(__append('\n<div class="page-actions-export btn-group">\n  <button type="button" class="btn btn-'),__append(type),__append(' dropdown-toggle" data-toggle="dropdown" '),__append(disabled?"disabled":""),__append('>\n    <i class="fa fa-download"></i><span>'),__append(label),__append('</span> <span class="caret"></span>\n  </button>\n  <ul class="dropdown-menu dropdown-menu-right">\n    '),_.forEach(formats,function(n){__append('\n    <li><a href="'),__append(escapeFn(n.href)),__append('">'),__append(t("core","PAGE_ACTION:export:"+n.type)),__append("</a></li>\n    ")}),__append("\n  </ul>\n</div>\n")),__append("\n");return __output.join("")}});