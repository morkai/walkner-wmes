define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<li data-online data-module="fte" class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__output.push(t("core","NAVBAR:FTE")),__output.push('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__output.push(t("core","NAVBAR:FTE:MASTER")),__output.push('\n    <li data-privilege="FTE:MASTER:VIEW"><a href="#fte/master">'),__output.push(t("core","NAVBAR:FTE:MASTER:LIST")),__output.push('</a>\n    <li data-privilege="FTE:MASTER:MANAGE"><a href="#fte/master;add">'),__output.push(t("core","NAVBAR:FTE:MASTER:CURRENT")),__output.push('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__output.push(t("core","NAVBAR:FTE:LEADER")),__output.push('\n    <li data-privilege="FTE:LEADER:VIEW"><a href="#fte/leader">'),__output.push(t("core","NAVBAR:FTE:LEADER:LIST")),__output.push('</a>\n    <li data-privilege="FTE:LEADER:MANAGE"><a href="#fte/leader;add">'),__output.push(t("core","NAVBAR:FTE:LEADER:CURRENT")),__output.push("</a>\n  </ul>\n");return __output.join("")}});