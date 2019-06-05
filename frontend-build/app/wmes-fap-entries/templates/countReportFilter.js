define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form fap-report-filter">\n  '),__append(forms.dateTimeRange({idPrefix:idPrefix})),__append('\n  <div class="form-group">\n    <label>'),__append(t("reports","filter:interval")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-interval" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),["year","quarter","month","week","day"].forEach(function(e){__append('\n      <label class="btn btn-default" title="'),__append(t("reports","filter:interval:title:"+e)),__append('" data-interval="'),__append(e),__append('">\n        <input type="radio" name="interval" value="'),__append(e),__append('"> '),__append(t("reports","filter:interval:"+e)),__append("\n      </label>\n      ")}),__append('\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-mrps">'),__append(helpers.t("PROPERTY:mrp")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-mrps" name="mrps" type="text" autocomplete="new-password" data-placeholder=" ">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-categories">'),__append(helpers.t("PROPERTY:category")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-categories" name="categories" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-subdivisionTypes">'),__append(helpers.t("PROPERTY:subdivisionType")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-subdivisionTypes" name="subdivisionTypes" class="form-control is-expandable" multiple size="1" data-expanded-length="10">\n      '),subdivisionTypes.forEach(function(e){__append('\n      <option value="'),__append(escapeFn(e)),__append('">'),__append(helpers.t("subdivisionType:"+e)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-divisions">'),__append(helpers.t("PROPERTY:divisions")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-divisions" name="divisions" class="form-control is-expandable" multiple size="1" data-expanded-length="10">\n      '),divisions.forEach(function(e){__append('\n      <option value="'),__append(escapeFn(e.id)),__append('">'),__append(escapeFn(e.text)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-levels">'),__append(helpers.t("PROPERTY:level")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-levels" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),[1,2,3,4].forEach(function(e){__append('\n        <label class="btn btn-default">\n          <input type="radio" name="levels" value="'),__append(e),__append('"> '),__append(e),__append("\n        </label>\n      ")}),__append('\n    </div>\n  </div>\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(t("reports","filter:submit")),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});