define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:DICTIONARIES")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="USERS:VIEW" data-module><a href="#users">'),__append(t("NAVBAR:USERS")),__append('</a>\n    <li class="divider">\n    '),["workplaces","divisions","buildings","locations","kinds","eventCategories","reasonCategories"].forEach(n=>{__append('\n    <li data-privilege="OSH:DICTIONARIES:VIEW" data-module="wmes-osh"><a href="#osh/'),__append(n),__append('">'),__append(t("wmes-osh-common",`navbar:${n}`)),__append("</a>\n    ")}),__append("\n  </ul>\n");return __output}});