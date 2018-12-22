define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li class="dropdown" data-online data-module="reports">\r\n  <a class="dropdown-toggle" data-toggle="dropdown">\r\n    '),__append(t("core","NAVBAR:REPORTS")),__append('\r\n    <b class="caret"></b>\r\n  </a>\r\n  <ul class="dropdown-menu">\r\n    <li data-privilege="REPORTS:VIEW REPORTS:1:VIEW"><a href="#reports/1">'),__append(t("core","NAVBAR:REPORTS:1")),__append('</a>\r\n    <li data-privilege="REPORTS:VIEW REPORTS:2:VIEW"><a href="#reports/clip">'),__append(t("core","NAVBAR:REPORTS:clip")),__append('</a>\r\n    <li data-privilege="REPORTS:VIEW REPORTS:3:VIEW"><a href="#reports/3">'),__append(t("core","NAVBAR:REPORTS:3")),__append('</a>\r\n    <li data-privilege="REPORTS:VIEW REPORTS:4:VIEW"><a href="#reports/4">'),__append(t("core","NAVBAR:REPORTS:4")),__append('</a>\r\n    <li data-privilege="REPORTS:VIEW REPORTS:5:VIEW"><a href="#reports/5">'),__append(t("core","NAVBAR:REPORTS:5")),__append('</a>\r\n    <li data-privilege="REPORTS:VIEW REPORTS:6:VIEW"><a href="#reports/6">'),__append(t("core","NAVBAR:REPORTS:6")),__append('</a>\r\n    <li data-privilege="REPORTS:VIEW REPORTS:7:VIEW"><a href="#reports/7">'),__append(t("core","NAVBAR:REPORTS:7")),__append('</a>\r\n    <li data-privilege="REPORTS:VIEW REPORTS:8:VIEW"><a href="#reports/8">'),__append(t("core","NAVBAR:REPORTS:8")),__append('</a>\r\n    <li data-privilege="REPORTS:VIEW REPORTS:9:VIEW"><a href="#reports/9">'),__append(t("core","NAVBAR:REPORTS:9")),__append('</a>\r\n    <li class="divider">\r\n    <li data-privilege="REPORTS:VIEW" data-module="vis"><a href="#vis/structure">'),__append(t("core","NAVBAR:VIS:STRUCTURE")),__append("</a>\r\n  </ul>\r\n");return __output.join("")}});