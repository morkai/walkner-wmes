define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="dummyPaint-startJob" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(escapeFn(formMethod)),__append('">\n  <div class="form-group has-required-select2">\n    <label for="'),__append(id("codes")),__append('" class="control-label is-required is-required-first-child" style="display: flex">\n      <span>'),__append(t("startJob:codes")),__append('</span>\n      <a id="'),__append(id("codes-all")),__append('" href="javascript:void(0)" style="margin-left: auto">'),__append(t("startJob:codes:all")),__append('</a>\n    </label>\n    <input id="'),__append(id("codes")),__append('" name="codes" type="text" required>\n  </div>\n  <div class="form-group has-required-select2">\n    <label for="'),__append(id("worker")),__append('" class="control-label is-required">'),__append(t("startJob:worker")),__append('</label>\n    <input id="'),__append(id("worker")),__append('" name="worker" type="text" required>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("notify")),__append('" class="control-label">'),__append(t("startJob:notify")),__append('</label>\n    <input id="'),__append(id("notify")),__append('" name="notify" type="text">\n  </div>\n  <div class="form-actions">\n    <button class="btn btn-primary" type="submit">'),__append(t("startJob:submit")),__append('</button>\n    <button class="btn btn-link cancel" type="button">'),__append(t("startJob:cancel")),__append("</button>\n  </div>\n</form>\n");return __output}});