define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form behaviorObsCards-report-filter">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-from">'),__append(t("core","filter:date:from")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="date" placeholder="'),__append(t("core","placeholder:date")),__append('">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-to">'),__append(t("core","filter:date:to")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="date" placeholder="'),__append(t("core","placeholder:date")),__append('">\n  </div>\n  <div class="form-group">\n    <label>'),__append(t("reports","filter:interval")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-interval" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),["year","quarter","month","week","day"].forEach(function(e){__append('\n        <label class="btn btn-default" title="'),__append(t("reports","filter:interval:title:"+e)),__append('" data-interval="'),__append(e),__append('">\n          <input type="radio" name="interval" value="'),__append(e),__append('"> '),__append(t("reports","filter:interval:"+e)),__append("\n        </label>\n      ")}),__append('\n    </div>\n  </div>\n  <div class="form-group">\n    <label>'),__append(helpers.t("PROPERTY:shift")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-shift" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),[0,1,2,3].forEach(function(e){__append('\n      <label class="btn btn-default">\n        <input type="radio" name="shift" value="'),__append(e),__append('"> '),__append(t("core","SHIFT:"+e)),__append("\n      </label>\n      ")}),__append('\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-company">'),__append(helpers.t("FORM:company")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-company" name="company" type="text" autocomplete="new-password">\n  </div>\n  <div style="margin-left: auto; width: 100%"></div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-sections">'),__append(helpers.t("filter:section")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-sections" name="sections" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-observerSections">'),__append(helpers.t("filter:observerSection")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-observerSections" name="observerSections" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-superior">'),__append(helpers.t("PROPERTY:superior")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-superior" name="superior" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group filter-actions">\n    <div class="btn-group">\n      <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(t("reports","filter:submit")),__append('</span></button>\n      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">\n        <span class="caret"></span>\n      </button>\n      <ul class="dropdown-menu">\n        '),["today","yesterday","currentWeek","prevWeek","lastTwoWeeks","currentMonth","prevMonth","q1","q2","q3","q4"].forEach(function(e){__append('\n        <li><a data-range="'),__append(e),__append('">'),__append(escapeFn(t("reports","filter:submit:"+e))),__append("</a></li>\n        ")}),__append('\n        <li><a data-range="currentYear" data-interval="quarter">'),__append(escapeFn(t("reports","filter:submit:currentYear"))),__append('</a></li>\n        <li><a data-range="prevYear" data-interval="quarter">'),__append(escapeFn(t("reports","filter:submit:prevYear"))),__append("</a></li>\n      </ul>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});