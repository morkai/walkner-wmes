define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="well filter-form">\n  '),function(){__output.push('<div class="form-group">\n  <label for="'),__output.push(idPrefix),__output.push('-from" title="'),__output.push(t("core","filter:date:from:info")),__output.push('"><span class="fa fa-info-circle"></span> '),__output.push(t("core","filter:date:from")),__output.push('</label>\n  <input id="'),__output.push(idPrefix),__output.push('-from" class="form-control" name="from" type="date" placeholder="YYYY-MM-DD" required>\n</div><div\n  class="form-group">\n  <label for="'),__output.push(idPrefix),__output.push('-to" title="'),__output.push(t("core","filter:date:to:info")),__output.push('"><span class="fa fa-info-circle"></span> '),__output.push(t("core","filter:date:to")),__output.push('</label>\n  <input id="'),__output.push(idPrefix),__output.push('-to" class="form-control" name="to" type="date" placeholder="YYYY-MM-DD" required>\n</div>\n')}(),__output.push('\n  <div class="form-group">\n    <label>'),__output.push(t("reports","filter:interval")),__output.push('</label>\n    <div id="'),__output.push(idPrefix),__output.push('-intervals" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),["year","quarter","month","week","day"].forEach(function(u){__output.push('\n      <label class="btn btn-default" title="'),__output.push(t("reports","filter:interval:title:"+u)),__output.push('" data-interval="'),__output.push(u),__output.push('">\n        <input type="radio" name="interval" value="'),__output.push(u),__output.push('"> '),__output.push(t("reports","filter:interval:"+u)),__output.push("\n      </label>\n      ")}),__output.push('\n    </div>\n  </div>\n  <div class="form-group filter-actions">\n    <div class="btn-group">\n      <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__output.push(escape(t("reports","filter:submit"))),__output.push('</span></button>\n      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">\n        <span class="caret"></span>\n      </button>\n      <ul class="dropdown-menu">\n        <li><a data-range="today">'),__output.push(escape(t("reports","filter:submit:today"))),__output.push('</a></li>\n        <li><a data-range="yesterday">'),__output.push(escape(t("reports","filter:submit:yesterday"))),__output.push('</a></li>\n        <li><a data-range="currentWeek">'),__output.push(escape(t("reports","filter:submit:currentWeek"))),__output.push('</a></li>\n        <li><a data-range="prevWeek">'),__output.push(escape(t("reports","filter:submit:prevWeek"))),__output.push('</a></li>\n        <li><a data-range="currentMonth">'),__output.push(escape(t("reports","filter:submit:currentMonth"))),__output.push('</a></li>\n        <li><a data-range="prevMonth">'),__output.push(escape(t("reports","filter:submit:prevMonth"))),__output.push('</a></li>\n        <li><a data-range="q1">'),__output.push(escape(t("reports","filter:submit:q1"))),__output.push('</a></li>\n        <li><a data-range="q2">'),__output.push(escape(t("reports","filter:submit:q2"))),__output.push('</a></li>\n        <li><a data-range="q3">'),__output.push(escape(t("reports","filter:submit:q3"))),__output.push('</a></li>\n        <li><a data-range="q4">'),__output.push(escape(t("reports","filter:submit:q4"))),__output.push('</a></li>\n        <li><a data-range="currentYear" data-interval="quarter">'),__output.push(escape(t("reports","filter:submit:currentYear"))),__output.push('</a></li>\n        <li><a data-range="prevYear" data-interval="quarter">'),__output.push(escape(t("reports","filter:submit:prevYear"))),__output.push('</a></li>\n      </ul>\n    </div><hr><button id="'),__output.push(idPrefix),__output.push('-showDisplayOptions" type="button" class="btn btn-default"><i class="fa fa-cog"></i><span>'),__output.push(t("reports","filter:options")),__output.push("</span></button>\n  </div>\n</form>\n");return __output.join("")}});