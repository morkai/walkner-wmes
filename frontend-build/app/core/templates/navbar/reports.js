define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li class="dropdown" data-online data-module="reports">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:REPORTS")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="REPORTS:VIEW REPORTS:1:VIEW" data-module="production"><a href="#reports/1">'),__append(t("NAVBAR:REPORTS:1")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:2:VIEW" data-module="production"><a href="#reports/clip">'),__append(t("NAVBAR:REPORTS:clip")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:3:VIEW" data-module="production"><a href="#reports/3">'),__append(t("NAVBAR:REPORTS:3")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:4:VIEW" data-module="production"><a href="#reports/4">'),__append(t("NAVBAR:REPORTS:4")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:5:VIEW" data-module="production"><a href="#reports/5">'),__append(t("NAVBAR:REPORTS:5")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:6:VIEW" data-module="production"><a href="#reports/6">'),__append(t("NAVBAR:REPORTS:6")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:7:VIEW" data-module="production"><a href="#reports/7">'),__append(t("NAVBAR:REPORTS:7")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:8:VIEW" data-module="production"><a href="#reports/8">'),__append(t("NAVBAR:REPORTS:8")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:9:VIEW" data-module="production"><a href="#reports/9">'),__append(t("NAVBAR:REPORTS:9")),__append('</a>\n    <li class="divider">\n    <li data-privilege="REPORTS:VIEW" data-module="vis"><a href="#vis/structure">'),__append(t("NAVBAR:VIS:STRUCTURE")),__append("</a>\n  </ul>\n");return __output.join("")}});