define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="dailyMrpPlans-import">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-date">'),__append(t("hourlyPlans","planning:import:date")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-date" name="date" class="form-control" type="date" value="'),__append(date),__append('" min="2017-01-01" max="'),__append(time.getMoment().add(7,"days").format("YYYY-MM-DD")),__append('" required autofocus>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-mrps">'),__append(t("hourlyPlans","planning:import:mrps")),__append('</label>\n    <div class="dailyMrpPlans-import-mrps">\n      '),mrps.forEach(function(n){__append('\n      <label class="checkbox-inline">\n        <input type="checkbox" name="mrps[]" value="'),__append(escape(n._id)),__append('" '),__append(n.checked?"checked":""),__append(">\n        "),__append(escape(n._id)),__append(" ("),__append(n.orderCount.toLocaleString()),__append(")\n      </label>\n      ")}),__append('\n    </div>\n  </div>\n  <div class="form-actions">\n    <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary">\n      <span class="fa fa-spinner fa-spin hidden"></span>\n      <span>'),__append(t("hourlyPlans","planning:import:submit")),__append('</span>\n    </button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("hourlyPlans","planning:import:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});