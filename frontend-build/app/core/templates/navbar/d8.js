define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li data-online data-privilege="D8:VIEW" class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("core","NAVBAR:D8:main")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:D8:entries")),__append('\n    <li class="navbar-with-button"><a href="#d8/entries">'),__append(t("core","NAVBAR:D8:all")),__append('</a><button class="btn btn-default" data-href="#d8/entries;add" data-privilege="D8:MANAGE"><i class="fa fa-plus"></i></button>\n    <li><a href="#d8/entries?status=open&sort(-d8OpenDate)&limit(20)">'),__append(t("core","NAVBAR:D8:open")),__append('</a>\n    <li><a href="#d8/entries?observers.user.id=mine&sort(-d8OpenDate)&limit(20)">'),__append(t("core","NAVBAR:D8:mine")),__append('</a>\n    <li><a href="#d8/entries?observers.user.id=unseen&sort(-d8OpenDate)&limit(20)">'),__append(t("core","NAVBAR:D8:unseen")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:D8:dictionaries")),__append('\n    <li data-privilege="D8:DICTIONARIES:VIEW"><a href="#d8/areas">'),__append(t("core","NAVBAR:D8:areas")),__append('</a>\n    <li data-privilege="D8:DICTIONARIES:VIEW"><a href="#d8/entrySources">'),__append(t("core","NAVBAR:D8:entrySources")),__append('</a>\n    <li data-privilege="D8:DICTIONARIES:VIEW"><a href="#d8/problemSources">'),__append(t("core","NAVBAR:D8:problemSources")),__append("</a>\n  </ul>\n");return __output.join("")}});