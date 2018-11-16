define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="orderDocumentTree-uploads panel panel-default">\n  <div id="'),__append(idPrefix),__append('-uploads" class="panel-body">\n    '),uploads.forEach(function(e,n){__append("\n    "),__append(renderUpload({upload:e,i:n})),__append("\n    ")}),__append('\n  </div>\n  <div class="panel-footer">\n    <div class="input-group orderDocumentTree-footer-setDate">\n      <input id="'),__append(idPrefix),__append('-date" type="date" class="form-control" min="2000-01-01" max="'),__append(time.getMoment().startOf("day").add(1,"years").format("YYYY-MM-DD")),__append('">\n      <span class="input-group-btn">\n        <button id="'),__append(idPrefix),__append('-setDate" class="btn btn-default" name="setDate" type="button" title="'),__append(t("orderDocumentTree","uploads:setDate")),__append('"><i class="fa fa-calendar-check-o"></i></button>\n      </span>\n    </div>\n    <button id="'),__append(idPrefix),__append('-submit" class="btn btn-primary" type="submit">\n      <i class="fa fa-upload"></i>\n      <span>'),__append(t("orderDocumentTree","uploads:submit")),__append("</span>\n    </button>\n  </div>\n</form>\n");return __output.join("")}});