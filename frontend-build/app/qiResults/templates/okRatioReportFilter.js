define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form qiResults-okRatioReport-filter">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-from">'),__append(t("core","filter:date:from")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="month" placeholder="'),__append(t("core","placeholder:month")),__append('">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-to">'),__append(t("core","filter:date:to")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="month" placeholder="'),__append(t("core","placeholder:month")),__append('">\n  </div>\n  <div class="form-group filter-actions">\n    <div class="btn-group">\n      <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(t("reports","filter:submit")),__append('</span></button>\n      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">\n        <span class="caret"></span>\n      </button>\n      <ul class="dropdown-menu">\n        '),["currentMonth","prevMonth","q1","q2","q3","q4","currentYear","prevYear"].forEach(function(e){__append('\n        <li><a data-range="'),__append(e),__append('">'),__append(escapeFn(t("reports","filter:submit:"+e))),__append("</a></li>\n        ")}),__append('\n        <li><a data-range="currentYear" data-interval="month">'),__append(escapeFn(t("reports","filter:submit:currentYear"))),__append('</a></li>\n        <li><a data-range="prevYear" data-interval="month">'),__append(escapeFn(t("reports","filter:submit:prevYear"))),__append("</a></li>\n      </ul>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});