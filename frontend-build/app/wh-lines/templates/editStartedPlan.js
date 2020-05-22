define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<form>\n  "),t.has("editStartedPlan:message")&&(__append('\n  <div class="message message-inline message-info" style="margin-bottom: 15px; text-align: justify">\n    '),__append(t("editStartedPlan:message")),__append("\n  </div>\n  ")),__append('\n  <div class="form-group">\n    <label class="control-label">'),__append(t("editStartedPlan:line")),__append('</label>\n    <p class="form-control-static">'),__append(escapeFn(line._id)),__append('</p>\n  </div>\n  <div class="form-row">\n    <div class="form-group">\n      <label class="control-label">'),__append(t("editStartedPlan:oldValue")),__append('</label>\n      <p class="form-control-static">'),__append(time.utc.format(line.startedPlan,"L")),__append('</p>\n    </div>\n    <div class="form-group">\n      <label class="control-label">'),__append(t("PROPERTY:nextShiftAt")),__append('</label>\n      <p class="form-control-static">\n        '),nextShiftAt?(__append('\n        <a id="'),__append(id("setNextShift")),__append('" href="javascript:void(0)">\n          <i class="fa fa-calendar-check-o"></i><span>'),__append(nextShiftAt),__append("</span>\n        </a>\n        ")):__append("\n        -\n        "),__append('\n      </p>\n    </div>\n  </div>\n  <div class="form-group has-required-select2">\n    <label for="'),__append(id("newValue")),__append('" class="control-label is-required">'),__append(t("editStartedPlan:newValue")),__append('</label>\n    <input id="'),__append(id("newValue")),__append('" class="form-control" type="date" required value="'),__append(curValue),__append('" min="'),__append(minValue),__append('" max="'),__append(maxValue),__append('">\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary">'),__append(t("editStartedPlan:submit")),__append('</button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output}});