define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li class="dropdown" data-online data-module="reports">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("core","NAVBAR:REPORTS")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="REPORTS:VIEW REPORTS:1:VIEW"><a href="#reports/1">'),__append(t("core","NAVBAR:REPORTS:1")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:2:VIEW"><a href="#reports/2">'),__append(t("core","NAVBAR:REPORTS:2")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:3:VIEW"><a href="#reports/3">'),__append(t("core","NAVBAR:REPORTS:3")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:4:VIEW"><a href="#reports/4">'),__append(t("core","NAVBAR:REPORTS:4")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:5:VIEW"><a href="#reports/5">'),__append(t("core","NAVBAR:REPORTS:5")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:6:VIEW"><a href="#reports/6">'),__append(t("core","NAVBAR:REPORTS:6")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:7:VIEW"><a href="#reports/7">'),__append(t("core","NAVBAR:REPORTS:7")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:8:VIEW"><a href="#reports/8">'),__append(t("core","NAVBAR:REPORTS:8")),__append('</a>\n    <!-- <li data-privilege="REPORTS:VIEW REPORTS:9:VIEW"><a href="#reports/9">'),__append(t("core","NAVBAR:REPORTS:9")),__append('</a> //-->\n    <li class="divider">\n    <li data-privilege="REPORTS:VIEW"><a href="#vis/structure">'),__append(t("core","NAVBAR:VIS:STRUCTURE")),__append("</a>\n  </ul>\n");return __output.join("")}});