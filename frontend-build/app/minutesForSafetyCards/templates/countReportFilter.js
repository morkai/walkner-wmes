define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form minutesForSafetyCards-report-filter">\r\n  <div class="form-group">\r\n    <label for="'),__append(idPrefix),__append('-from">'),__append(t("core","filter:date:from")),__append('</label>\r\n    <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="date" placeholder="'),__append(t("core","placeholder:date")),__append('">\r\n  </div>\r\n  <div class="form-group">\r\n    <label for="'),__append(idPrefix),__append('-to">'),__append(t("core","filter:date:to")),__append('</label>\r\n    <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="date" placeholder="'),__append(t("core","placeholder:date")),__append('">\r\n  </div>\r\n  <div class="form-group">\r\n    <label>'),__append(t("reports","filter:interval")),__append('</label>\r\n    <div id="'),__append(idPrefix),__append('-interval" class="btn-group filter-btn-group" data-toggle="buttons">\r\n      '),["year","quarter","month","week","day"].forEach(function(e){__append('\r\n      <label class="btn btn-default" title="'),__append(t("reports","filter:interval:title:"+e)),__append('" data-interval="'),__append(e),__append('">\r\n        <input type="radio" name="interval" value="'),__append(e),__append('"> '),__append(t("reports","filter:interval:"+e)),__append("\r\n      </label>\r\n      ")}),__append('\r\n    </div>\r\n  </div>\r\n  <div class="form-group">\r\n    <label for="'),__append(idPrefix),__append('-sections">'),__append(helpers.t("PROPERTY:section")),__append('</label>\r\n    <input id="'),__append(idPrefix),__append('-sections" name="sections" type="text">\r\n  </div>\r\n  <div class="form-group">\r\n    <label for="'),__append(idPrefix),__append('-owner">'),__append(helpers.t("PROPERTY:owner")),__append('</label>\r\n    <input id="'),__append(idPrefix),__append('-owner" name="owner" type="text">\r\n  </div>\r\n  <div class="form-group filter-actions">\r\n    <div class="btn-group">\r\n      <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(t("reports","filter:submit")),__append('</span></button>\r\n      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">\r\n        <span class="caret"></span>\r\n      </button>\r\n      <ul class="dropdown-menu">\r\n        '),["today","yesterday","currentWeek","prevWeek","lastTwoWeeks","currentMonth","prevMonth","q1","q2","q3","q4"].forEach(function(e){__append('\r\n        <li><a data-range="'),__append(e),__append('">'),__append(escapeFn(t("reports","filter:submit:"+e))),__append("</a></li>\r\n        ")}),__append('\r\n        <li><a data-range="currentYear" data-interval="quarter">'),__append(escapeFn(t("reports","filter:submit:currentYear"))),__append('</a></li>\r\n        <li><a data-range="prevYear" data-interval="quarter">'),__append(escapeFn(t("reports","filter:submit:prevYear"))),__append("</a></li>\r\n      </ul>\r\n    </div>\r\n  </div>\r\n</form>\r\n");return __output.join("")}});