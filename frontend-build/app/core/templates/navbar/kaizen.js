define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li data-online data-loggedin class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("core","NAVBAR:KAIZEN:main")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:KAIZEN:orders")),__append('\n    <li data-module="kaizen" class="navbar-with-button"><a href="#kaizenOrders">'),__append(t("core","NAVBAR:KAIZEN:all")),__append('</a><button class="btn btn-default" data-href="#kaizenOrders;add"><i class="fa fa-plus"></i></button>\n    <li data-module="kaizen"><a href="#kaizenOrders?status=in=(new,accepted,todo,inProgress,paused)&sort(-eventDate)&limit(20)">'),__append(t("core","NAVBAR:KAIZEN:open")),__append('</a>\n    <li data-module="kaizen"><a href="#kaizenOrders?observers.user.id=mine&sort(-eventDate)&limit(20)">'),__append(t("core","NAVBAR:KAIZEN:mine")),__append('</a>\n    <li data-module="kaizen"><a href="#kaizenOrders?observers.user.id=unseen&sort(-eventDate)&limit(20)">'),__append(t("core","NAVBAR:KAIZEN:unseen")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:KAIZEN:reports")),__append('\n    <li data-module="kaizen"><a href="#kaizenReport">'),__append(t("core","NAVBAR:KAIZEN:reports:count")),__append('</a>\n    <li data-module="kaizen"><a href="#kaizenSummaryReport">'),__append(t("core","NAVBAR:KAIZEN:reports:summary")),__append('</a>\n    <li data-module="kaizen"><a href="#kaizenEngagementReport">'),__append(t("core","NAVBAR:KAIZEN:reports:engagement")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:KAIZEN:dictionaries")),__append('\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenSections">'),__append(t("core","NAVBAR:KAIZEN:sections")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenAreas">'),__append(t("core","NAVBAR:KAIZEN:areas")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenCategories">'),__append(t("core","NAVBAR:KAIZEN:categories")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenCauses">'),__append(t("core","NAVBAR:KAIZEN:causes")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenRisks">'),__append(t("core","NAVBAR:KAIZEN:risks")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenBehaviours">'),__append(t("core","NAVBAR:KAIZEN:behaviours")),__append('</a>\n    <li class="divider">\n    <li data-module="kaizen"><a href="#kaizenHelp">'),__append(t("core","NAVBAR:KAIZEN:help")),__append("</a>\n  </ul>\n");return __output.join("")}});