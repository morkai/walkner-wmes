define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<li class="dropdown" data-online data-module="reports" data-privilege="REPORTS:VIEW">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__output.push(t("core","NAVBAR:REPORTS")),__output.push('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li><a href="#reports/1">'),__output.push(t("core","NAVBAR:REPORTS:1")),__output.push('</a>\n    <li><a href="#reports/2">'),__output.push(t("core","NAVBAR:REPORTS:2")),__output.push('</a>\n    <li><a href="#reports/3">'),__output.push(t("core","NAVBAR:REPORTS:3")),__output.push('</a>\n    <li><a href="#reports/4">'),__output.push(t("core","NAVBAR:REPORTS:4")),__output.push('</a>\n    <li><a href="#reports/5">'),__output.push(t("core","NAVBAR:REPORTS:5")),__output.push('</a>\n    <li><a href="#reports/6">'),__output.push(t("core","NAVBAR:REPORTS:6")),__output.push('</a>\n    <li><a href="#reports/7">'),__output.push(t("core","NAVBAR:REPORTS:7")),__output.push('</a>\n    <li class="divider">\n    <li><a href="#vis/structure">'),__output.push(t("core","NAVBAR:VIS:STRUCTURE")),__output.push("</a>\n  </ul>\n");return __output.join("")}});