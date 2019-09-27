define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  <div class="form-group">\n    <label>'),__append(t("reports","7:filter:statuses")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-statuses" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),["undecided","rejected","confirmed"].forEach(function(e){__append('\n      <label class="btn btn-default">\n        <input type="checkbox" name="statuses[]" value="'),__append(e),__append('"> '),__append(t("prodDowntimes","PROPERTY:status:"+e)),__append("\n      </label>\n      ")}),__append('\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-specificAor">'),__append(t("reports","7:filter:specificAor")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-specificAor" name="specificAor" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group reports-7-filter-aors">\n    <label for="'),__append(idPrefix),__append('-aors">'),__append(t("reports","7:filter:aors")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-aors" name="aors" type="text" autocomplete="new-password" placeholder="'),__append(t("reports","7:filter:aors:ph")),__append('">\n  </div>\n  <div class="form-group no-label">\n    <button id="'),__append(idPrefix),__append('-customTimes" type="button" class="btn btn-default"><i class="fa fa-calendar"></i><span>'),__append(t("reports","7:filter:customTimes")),__append('</span></button>\n  </div>\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("reports","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});