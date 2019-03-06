define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-image" class="control-label is-required">'),__append(helpers.t("imageEditForm:file")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-image" name="image" class="form-control" type="file" autofocus required>\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary"><i class="fa fa-spinner fa-spin hidden"></i><span>'),__append(helpers.t("imageEditForm:submit")),__append('</span></button>\n    <button type="button" class="cancel btn btn-link">'),__append(helpers.t("imageEditForm:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});