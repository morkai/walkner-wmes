define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  '),function(){__append('<div class="form-group">\n  <label for="'),__append(idPrefix),__append('-from" title="'),__append(t("core","filter:date:from:info")),__append('"><span class="fa fa-info-circle"></span> '),__append(t("core","filter:date:from")),__append('</label>\n  <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="date" placeholder="YYYY-MM-DD" required min="'),__append(PRODUCTION_DATA_START_DATE),__append('">\n</div><div\n  class="form-group">\n  <label for="'),__append(idPrefix),__append('-to" title="'),__append(t("core","filter:date:to:info")),__append('"><span class="fa fa-info-circle"></span> '),__append(t("core","filter:date:to")),__append('</label>\n  <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="date" placeholder="YYYY-MM-DD" required min="'),__append(PRODUCTION_DATA_START_DATE),__append('">\n</div>\n')}.call(this),__append('\n  <div class="form-group">\n    <label>'),__append(t("reports","filter:interval")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-interval" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),["year","quarter","month","week","day","shift"].forEach(function(e){__append('\n      <label class="btn btn-default" title="'),__append(t("reports","filter:interval:title:"+e)),__append('" data-interval="'),__append(e),__append('">\n        <input type="radio" name="interval" value="'),__append(e),__append('"> '),__append(t("reports","filter:interval:"+e)),__append("\n      </label>\n      ")}),__append('\n    </div>\n  </div>\n  <div class="form-group filter-actions">\n    <div class="btn-group">\n      <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("reports","filter:submit"))),__append('</span></button>\n      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">\n        <span class="caret"></span>\n      </button>\n      <ul class="dropdown-menu">\n        <li><a data-range="yesterday" data-interval="shift">'),__append(escapeFn(t("reports","filter:submit:yesterday"))),__append('</a></li>\n        <li><a data-range="currentWeek">'),__append(escapeFn(t("reports","filter:submit:currentWeek"))),__append('</a></li>\n        <li><a data-range="prevWeek">'),__append(escapeFn(t("reports","filter:submit:prevWeek"))),__append('</a></li>\n        <li><a data-range="currentMonth">'),__append(escapeFn(t("reports","filter:submit:currentMonth"))),__append('</a></li>\n        <li><a data-range="prevMonth">'),__append(escapeFn(t("reports","filter:submit:prevMonth"))),__append('</a></li>\n        <li><a data-range="q1">'),__append(escapeFn(t("reports","filter:submit:q1"))),__append('</a></li>\n        <li><a data-range="q2">'),__append(escapeFn(t("reports","filter:submit:q2"))),__append('</a></li>\n        <li><a data-range="q3">'),__append(escapeFn(t("reports","filter:submit:q3"))),__append('</a></li>\n        <li><a data-range="q4">'),__append(escapeFn(t("reports","filter:submit:q4"))),__append('</a></li>\n        <li><a data-range="currentYear" data-interval="quarter">'),__append(escapeFn(t("reports","filter:submit:currentYear"))),__append('</a></li>\n        <li><a data-range="prevYear" data-interval="quarter">'),__append(escapeFn(t("reports","filter:submit:prevYear"))),__append("</a></li>\n      </ul>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});