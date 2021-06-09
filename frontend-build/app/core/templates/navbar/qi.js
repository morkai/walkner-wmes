define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output="";function __append(a){void 0!==a&&null!==a&&(__output+=a)}with(locals||{})__append('<li data-online data-privilege="QI:RESULTS:VIEW FN:master FN:leader FN:manager FN:wh" data-module="qi" class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:QI:main")),__append('\n    <span class="qi-counter hidden"><span class="qi-counter-actual">0</span>/<span class="qi-counter-required">0</span></span>\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__append(t("NAVBAR:QI:results")),__append('\n    <li><a href="#qi/results">'),__append(t("NAVBAR:QI:results:all")),__append('</a>\n    <li class="navbar-with-button"><a href="#qi/results;ok">'),__append(t("NAVBAR:QI:results:good")),__append('</a><button class="btn btn-success" data-privilege="QI:INSPECTOR QI:MANAGE FN:leader FN:wh" data-href="#qi/results;add?ok"><i class="fa fa-plus"></i></button>\n    <li class="navbar-with-button"><a href="#qi/results;nok">'),__append(t("NAVBAR:QI:results:bad")),__append('</a><button class="btn btn-danger" data-privilege="QI:INSPECTOR QI:MANAGE FN:leader FN:wh" data-href="#qi/results;add?nok"><i class="fa fa-plus"></i></button>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:QI:reports")),__append('\n    <li><a href="#qi/reports/count">'),__append(t("NAVBAR:QI:reports:count")),__append('</a>\n    <li><a href="#qi/reports/okRatio">'),__append(t("NAVBAR:QI:reports:okRatio")),__append('</a>\n    <li><a href="#qi/reports/nokRatio">'),__append(t("NAVBAR:QI:reports:nokRatio")),__append('</a>\n    <li><a href="#qi/reports/outgoingQuality">'),__append(t("NAVBAR:QI:reports:outgoingQuality")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:QI:dictionaries")),__append('\n    <li data-privilege="QI:DICTIONARIES:VIEW"><a href="#qi/kinds">'),__append(t("NAVBAR:QI:kinds")),__append('</a>\n    <li data-privilege="QI:DICTIONARIES:VIEW"><a href="#qi/errorCategories">'),__append(t("NAVBAR:QI:errorCategories")),__append('</a>\n    <li data-privilege="QI:DICTIONARIES:VIEW"><a href="#qi/faults">'),__append(t("NAVBAR:QI:faults")),__append('</a>\n    <li data-privilege="QI:DICTIONARIES:VIEW"><a href="#qi/standards">'),__append(t("NAVBAR:QI:standards")),__append('</a>\n    <li data-privilege="QI:DICTIONARIES:VIEW"><a href="#qi/actionStatuses">'),__append(t("NAVBAR:QI:actionStatuses")),__append("</a>\n  </ul>\n");return __output}});