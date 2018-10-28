define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="orders-commentForm">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-source" class="control-label">'),__append(t("orders","commentForm:source")),__append("</label>\n    <br>\n    "),["other","ps","wh"].forEach(function(e){__append('\n    <label class="radio-inline">\n      <input type="radio" name="source" value="'),__append(e),__append('" required> '),__append(t("orders","commentForm:source:"+e)),__append("\n    </label>\n    ")}),__append('\n  </div>\n  <div class="row">\n    <div class="col-md-4 form-group has-required-select2">\n      <label for="'),__append(idPrefix),__append('-delayReason" class="control-label">'),__append(t("orders","commentForm:delayReason")),__append('</label>\n      <input id="'),__append(idPrefix),__append('-delayReason" type="text" autocomplete="new-password" name="delayReason">\n    </div>\n    <div class="col-md-8 form-group">\n      <label class="control-label">'),__append(t("orders","PROPERTY:m4")),__append("</label>\n      <br>\n      "),["man","machine","material","method"].forEach(function(e){__append('\n      <label class="radio-inline">\n        <input type="radio" name="m4" value="'),__append(e),__append('"> '),__append(t("orders","m4:"+e)),__append("\n      </label>\n      ")}),__append('\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-comment" class="control-label is-required">'),__append(t("orders","commentForm:comment")),__append('</label>\n    <textarea id="'),__append(idPrefix),__append('-comment" class="form-control" name="comment" rows="3" required></textarea>\n  </div>\n  <button id="'),__append(idPrefix),__append('-submit-comment" type="submit" class="btn btn-primary"><i class="fa fa-comment"></i><span>'),__append(t("orders","commentForm:submit:comment")),__append('</span></button>\n  <button id="'),__append(idPrefix),__append('-submit-edit" type="submit" class="btn btn-primary hidden"><i class="fa fa-edit"></i><span>'),__append(t("orders","commentForm:submit:edit")),__append("</span></button>\n</form>\n");return __output.join("")}});