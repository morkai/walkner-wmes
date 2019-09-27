define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="production-snChecker" autocomplete="off">\n  <div class="row">\n    <div class="col-lg-8">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-orderNo">'),__append(t("production","taktTime:check:orderNo")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-orderNo" class="form-control" type="text" autocomplete="new-password" value="'),__append(orderNo),__append('" required pattern="^[0-9]{9}$" data-sn-accept>\n      </div>\n    </div>\n    <div class="col-lg-4">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-serialNo">'),__append(t("production","taktTime:check:serialNo")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-serialNo" class="form-control" type="number" min="1" max="9999" required data-sn-accept>\n      </div>\n    </div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-message" class="message message-inline message-warning">\n    '),__append(t("production","taktTime:check:help")),__append('\n  </div>\n  <div class="form-actions">\n    <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-lg btn-primary">'),__append(t("production","taktTime:check:submit")),__append('</button>\n    <button id="'),__append(idPrefix),__append('-list" type="button" class="btn btn-lg btn-link">'),__append(t("production","taktTime:check:list")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});