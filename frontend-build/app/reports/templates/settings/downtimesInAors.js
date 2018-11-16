define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel-body" data-tab="downtimesInAors">\n  <div class="form-group">\n    <label class="control-label">'),__append(t("reports","settings:downtimesInAors:statuses")),__append("</label>\n    <br>\n    "),["undecided","rejected","confirmed"].forEach(function(e){__append('\n    <div class="checkbox-inline">\n      <label>\n        <input name="reports.downtimesInAors.statuses" type="checkbox" value="'),__append(e),__append('">\n        '),__append(t("prodDowntimes","PROPERTY:status:"+e)),__append("\n      </label>\n    </div>\n    ")}),__append('\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-downtimesInAors-specificAor" class="control-label">'),__append(t("reports","settings:downtimesInAors:specificAor")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-downtimesInAors-specificAor" name="reports.downtimesInAors.specificAor" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    <div class="radio">\n      <label class="control-label">\n        <input type="radio" name="downtimesInAorsType" value="own" data-change-delay="0">\n        '),__append(t("reports","settings:downtimesInAors:aors:own")),__append('\n      </label>\n    </div>\n    <div class="radio">\n      <label class="control-label">\n        <input type="radio" name="downtimesInAorsType" value="specific" data-change-delay="0">\n        '),__append(t("reports","settings:downtimesInAors:aors:specific")),__append('\n      </label>\n    </div>\n    <input id="'),__append(idPrefix),__append('-downtimesInAors-aors" name="reports.downtimesInAors.aors" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-clipDateRange" class="control-label">'),__append(t("reports","settings:downtimesInAors:clipDateRange")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-clipDateRange" name="reports.downtimesInAors.clipDateRange" class="form-control">\n      '),["today","yesterday","currentWeek","prevWeek","currentMonth","prevMonth","currentQuarter","currentYear","prevYear"].forEach(function(e){__append('\n      <option value="'),__append(e),__append('">'),__append(t("reports","filter:submit:"+e)),__append("\n        ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label class="control-label">'),__append(t("reports","settings:downtimesInAors:clipInterval")),__append("</label>\n    <br>\n    "),["year","quarter","month","week","day"].forEach(function(e){__append('\n    <div class="radio-inline">\n      <label>\n        <input name="reports.downtimesInAors.clipInterval" type="radio" value="'),__append(e),__append('">\n        '),__append(t("reports","filter:interval:title:"+e)),__append("\n      </label>\n    </div>\n    ")}),__append('\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-dtlDateRange" class="control-label">'),__append(t("reports","settings:downtimesInAors:dtlDateRange")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-dtlDateRange" name="reports.downtimesInAors.dtlDateRange" class="form-control">\n      '),["today","yesterday","currentWeek","prevWeek","currentMonth","prevMonth","currentQuarter","currentYear","prevYear"].forEach(function(e){__append('\n      <option value="'),__append(e),__append('">'),__append(t("reports","filter:submit:"+e)),__append("\n        ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-dtcDateRange" class="control-label">'),__append(t("reports","settings:downtimesInAors:dtcDateRange")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-dtcDateRange" name="reports.downtimesInAors.dtcDateRange" class="form-control">\n      '),["today","yesterday","currentWeek","prevWeek","currentMonth","prevMonth","currentQuarter","currentYear","prevYear"].forEach(function(e){__append('\n      <option value="'),__append(e),__append('">'),__append(t("reports","filter:submit:"+e)),__append("\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label class="control-label">'),__append(t("reports","settings:downtimesInAors:dtcInterval")),__append("</label>\n    <br>\n    "),["year","quarter","month","week","day"].forEach(function(e){__append('\n    <div class="radio-inline">\n      <label>\n        <input name="reports.downtimesInAors.dtcInterval" type="radio" value="'),__append(e),__append('">\n        '),__append(t("reports","filter:interval:title:"+e)),__append("\n      </label>\n    </div>\n    ")}),__append("\n  </div>\n</div>\n");return __output.join("")}});