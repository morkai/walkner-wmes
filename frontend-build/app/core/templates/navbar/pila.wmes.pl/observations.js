define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output="";function __append(a){void 0!==a&&null!==a&&(__output+=a)}with(locals||{})__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:pila:observations")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__append(t("NAVBAR:pila:observations:entries")),__append('\n    <li data-privilege="USER" data-module class="navbar-with-button"><a href="#behaviorObsCards">'),__append(t("NAVBAR:KAIZEN:all")),__append('</a><button class="btn btn-default" data-href="#behaviorObsCards;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="USER" data-module><a href="#behaviorObsCards?users=mine&sort(-date)&limit(20)">'),__append(t("NAVBAR:KAIZEN:mine")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:pila:reports")),__append('\n    <li data-privilege="USER" data-module="behaviorObsCards"><a href="#behaviorObsCardCountReport">'),__append(t("NAVBAR:KAIZEN:reports:observations")),__append('</a>\n    <li data-privilege="USER" data-module="kaizen"><a href="#kaizenEngagementReport">'),__append(t("NAVBAR:KAIZEN:reports:engagement")),__append('</a>\n    <li data-privilege="USER" data-module="kaizen"><a href="#kaizenMetricsReport">'),__append(t("NAVBAR:KAIZEN:reports:metrics")),__append("</a>\n  </ul>\n");return __output}});