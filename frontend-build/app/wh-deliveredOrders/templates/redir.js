define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(escapeFn(formMethod)),__append('">\n  <div class="form-group">\n    <label  for="'),__append(id("sapOrder")),__append('" class="control-label is-required">'),__append(t("redir:sapOrder")),__append('</label>\n    <input id="'),__append(id("sapOrder")),__append('" name="sapOrder" class="form-control" type="text" required pattern="^[0-9]{9}$" autocomplete="new-password">\n  </div>\n  <div class="row">\n    <div class="col-md-6">\n      <div class="form-group">\n        <label for="'),__append(id("sourceLine")),__append('" class="control-label">'),__append(t("redir:sourceLine")),__append('</label>\n        <input id="'),__append(id("sourceLine")),__append('" name="sourceLine" type="text">\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("redir:sourceQty")),__append('</label>\n        <p id="'),__append(id("sourceQty")),__append('" class="form-control-static" style="height: 34px">?</p>\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("redir:pceTime")),__append('</label>\n        <p id="'),__append(id("sourcePceTime")),__append('" class="form-control-static" style="height: 34px">?</p>\n      </div>\n    </div>\n    <div class="col-md-6">\n      <div class="form-group has-required-select2">\n        <label for="'),__append(id("targetLine")),__append('" class="control-label is-required">'),__append(t("redir:targetLine")),__append('</label>\n        <input id="'),__append(id("targetLine")),__append('" name="targetLine" type="text" required>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(id("targetQty")),__append('" class="control-label is-required">'),__append(t("redir:targetQty")),__append('</label>\n        <input id="'),__append(id("targetQty")),__append('" name="targetQty" class="form-control" type="number" required min="1" max="999">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(id("targetPceTime")),__append('" class="control-label is-required">'),__append(t("redir:pceTime")),__append('</label>\n        <input id="'),__append(id("targetPceTime")),__append('" name="pceTime" class="form-control" type="text" required pattern="^[0-9]{2}:[0-9]{2}:[0-9]{2}$">\n      </div>\n    </div>\n  </div>\n  <p id="'),__append(id("noSourceMsg")),__append('" class="message message-inline message-warning text-justify" style="margin-top: 15px">'),__append(t("redir:msg:noSource")),__append('</p>\n  <div class="form-actions">\n    <button class="btn btn-primary" type="submit">'),__append(t("redir:submit")),__append('</button>\n    <button class="btn btn-link cancel" type="button">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output}});