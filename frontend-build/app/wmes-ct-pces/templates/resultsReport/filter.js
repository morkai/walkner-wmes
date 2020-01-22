define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="well filter-form ct-report-groups-filter" autocomplete="off">\n  '),__append(forms.dateTimeRange({idPrefix:idPrefix,required:!0})),__append('\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-shiftCount" class="control-label">'),__append(t("resultsReport:filter:shiftCount")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-shiftCount" name="shiftCount" class="form-control" type="number" min="1" max="3" placeholder="3" style="width: 80px">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-includedMrps" class="control-label">'),__append(t("resultsReport:filter:includedMrps")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-includedMrps" name="includedMrps" type="text">\n  </div>\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(t("reports","filter:submit")),__append("</span></button>\n  </div>\n</form>\n");return __output}});