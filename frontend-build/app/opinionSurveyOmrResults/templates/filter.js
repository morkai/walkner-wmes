define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form opinionSurveyOmrResults-filter">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-status">'),__append(t("opinionSurveyOmrResults","PROPERTY:status")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-status" name="status" class="form-control">\n      <option></option>\n      '),["unrecognized","recognized","ignored","fixed"].forEach(function(e){__append('\n      <option value="'),__append(e),__append('">'),__append(t("opinionSurveyOmrResults","status:"+e)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-survey">'),__append(t("opinionSurveyOmrResults","PROPERTY:survey")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-survey" name="survey" type="text" autocomplete="new-password">\n  </div>\n  '),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("opinionSurveyOmrResults","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});