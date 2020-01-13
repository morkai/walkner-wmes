define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<li class="dropdown" data-online data-module="reports">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:REPORTS")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="REPORTS:VIEW REPORTS:1:VIEW" data-module="production"><a href="#reports/1">'),__append(t("NAVBAR:REPORTS:1")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:2:VIEW" data-module="production"><a href="#reports/clip">'),__append(t("NAVBAR:REPORTS:clip")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:3:VIEW" data-module="production"><a href="#reports/3">'),__append(t("NAVBAR:REPORTS:3")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:4:VIEW" data-module="production"><a href="#reports/4">'),__append(t("NAVBAR:REPORTS:4")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:5:VIEW" data-module="production"><a href="#reports/5">'),__append(t("NAVBAR:REPORTS:5")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:6:VIEW" data-module="production"><a href="#reports/6">'),__append(t("NAVBAR:REPORTS:6")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:7:VIEW" data-module="production"><a href="#reports/7">'),__append(t("NAVBAR:REPORTS:7")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:8:VIEW" data-module="production"><a href="#reports/8">'),__append(t("NAVBAR:REPORTS:8")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:9:VIEW" data-module="production"><a href="#reports/9">'),__append(t("NAVBAR:REPORTS:9")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:REPORTS:ct")),__append('\n    <li data-privilege="PROD_DATA:VIEW" data-client-module="wmes-ct-pces"><a href="#ct/reports/pce">'),__append(t("NAVBAR:REPORTS:ct:pce")),__append('</a>\n    <li data-privilege="PROD_DATA:VIEW" data-client-module="wmes-ct-pces"><a href="#ct/reports/groups">'),__append(t("NAVBAR:REPORTS:ct:groups")),__append('</a>\n    <li class="disabled" data-privilege="PROD_DATA:VIEW" data-client-module="wmes-ct-pces"><a href="#ct/reports/results">'),__append(t("NAVBAR:REPORTS:ct:results")),__append('</a>\n    <li class="divider">\n    <li data-privilege="REPORTS:VIEW" data-module="vis"><a href="#vis/structure">'),__append(t("NAVBAR:VIS:STRUCTURE")),__append("</a>\n  </ul>\n");return __output}});