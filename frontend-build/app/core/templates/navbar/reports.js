define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<li class="dropdown" data-online>\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    ',t("core","NAVBAR:REPORTS"),'\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="REPORTS:VIEW"><a href="#reports/1">',t("core","NAVBAR:REPORTS:1"),'</a>\n    <li data-privilege="REPORTS:VIEW"><a href="#reports/2">',t("core","NAVBAR:REPORTS:2"),'</a>\n    <li data-privilege="REPORTS:VIEW"><a href="#reports/3">',t("core","NAVBAR:REPORTS:3"),'</a>\n    <li data-privilege="REPORTS:VIEW"><a href="#reports/4">',t("core","NAVBAR:REPORTS:4"),'</a>\n    <li data-privilege="REPORTS:VIEW"><a href="#reports/5">',t("core","NAVBAR:REPORTS:5"),'</a>\n    <li data-privilege="REPORTS:VIEW" class="divider">\n    <li data-privilege="REPORTS:VIEW"><a href="#vis/structure">',t("core","NAVBAR:VIS:STRUCTURE"),"</a>\n  </ul>\n")}();return buf.join("")}});