define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("core","NAVBAR:SUGGESTIONS:main")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:SUGGESTIONS:orders")),__append('\n    <li data-privilege="LOCAL USER" data-module class="navbar-with-button"><a href="#suggestions">'),__append(t("core","NAVBAR:SUGGESTIONS:all")),__append('</a><button class="btn btn-default" data-href="#suggestions;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="LOCAL USER" data-module><a href="#suggestions?status=in=(new,accepted,todo,inProgress,paused)&sort(-date)&limit(20)">'),__append(t("core","NAVBAR:SUGGESTIONS:open")),__append('</a>\n    <li data-privilege="USER" data-module><a href="#suggestions?observers.user.id=mine&sort(-date)&limit(20)">'),__append(t("core","NAVBAR:SUGGESTIONS:mine")),__append('</a>\n    <li data-privilege="USER" data-module><a href="#suggestions?observers.user.id=unseen&sort(-date)&limit(20)">'),__append(t("core","NAVBAR:SUGGESTIONS:unseen")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:SUGGESTIONS:reports")),__append('\n    <li data-privilege="USER" data-module="suggestions"><a href="#suggestionCountReport">'),__append(t("core","NAVBAR:SUGGESTIONS:reports:count")),__append('</a>\n    <li data-privilege="USER" data-module="suggestions"><a href="#suggestionSummaryReport">'),__append(t("core","NAVBAR:SUGGESTIONS:reports:summary")),__append('</a>\n    <li data-privilege="USER" data-module="suggestions"><a href="#suggestionEngagementReport">'),__append(t("core","NAVBAR:SUGGESTIONS:reports:engagement")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:SUGGESTIONS:dictionaries")),__append('\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="suggestions"><a href="#kaizenSections">'),__append(t("core","NAVBAR:SUGGESTIONS:sections")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="suggestions"><a href="#kaizenCategories">'),__append(t("core","NAVBAR:SUGGESTIONS:categories")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="suggestions"><a href="#kaizenProductFamilies">'),__append(t("core","NAVBAR:SUGGESTIONS:productFamilies")),__append('</a>\n    <li class="divider">\n    <li data-module="suggestions"><a href="#suggestionHelp">'),__append(t("core","NAVBAR:SUGGESTIONS:help")),__append("</a>\n  </ul>\n");return __output.join("")}});