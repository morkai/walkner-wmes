define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="fap-addForm">\n  '),user.isLoggedIn()||(__append('\n  <div class="form-group has-required-select2">\n    <label for="'),__append(idPrefix),__append('-owner" class="control-label is-required">'),__append(helpers.t("PROPERTY:owner")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-owner" name="owner" required>\n  </div>\n  ')),__append('\n  <div style="display: flex">\n    <div class="form-group" style="margin-right: 15px">\n      <label for="'),__append(idPrefix),__append('-orderNo" class="control-label">'),__append(helpers.t("PROPERTY:orderNo")),__append('</label>\n      <input id="'),__append(idPrefix),__append('-orderNo" name="orderNo" class="form-control text-mono" maxlength="9" pattern="^[0-9]{9}$" style="width: 85px">\n    </div>\n    <div class="form-group">\n      <label for="'),__append(idPrefix),__append('-lines" class="control-label">'),__append(helpers.t("PROPERTY:lines")),__append('</label>\n      <input id="'),__append(idPrefix),__append('-lines" name="lines" style="width: 300px">\n    </div>\n  </div>\n  <div class="form-group has-required-select2">\n    <div style="display: flex">\n      <label for="'),__append(idPrefix),__append('-category" class="control-label is-required">'),__append(helpers.t("PROPERTY:category")),__append('</label>\n      <i id="'),__append(idPrefix),__append('-notifications" class="fa fa-group fap-addForm-notifications"></i>\n    </div>\n    <input id="'),__append(idPrefix),__append('-category" name="category" required>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-problem" class="control-label is-required">'),__append(helpers.t("PROPERTY:problem")),__append('</label>\n    <textarea id="'),__append(idPrefix),__append('-problem" name="problem" class="form-control text-mono" rows="4" required style="resize: none"></textarea>\n  </div>\n  <div class="form-group has-required-select2">\n    <label for="'),__append(idPrefix),__append('-subdivisions" class="control-label is-required">'),__append(helpers.t("addForm:subdivisions")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-subdivisions" name="subdivisions" required>\n  </div>\n  <div class="form-group" style="margin-bottom: 12px">\n    <label class="control-label">'),__append(helpers.t("PROPERTY:uploads")),__append('</label>\n    <ul id="'),__append(idPrefix),__append('-uploads" class="fap-addForm-uploads">\n      <li>'),__append(helpers.t("addForm:upload:drop")),__append('</li>\n    </ul>\n  </div>\n  <div class="form-group">\n    <button id="'),__append(idPrefix),__append('-submit" class="btn btn-primary">'),__append(helpers.t("addForm:submit")),__append('</button>\n    <button id="'),__append(idPrefix),__append('-cancel" type="button" class="btn btn-link">'),__append(helpers.t("addForm:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});