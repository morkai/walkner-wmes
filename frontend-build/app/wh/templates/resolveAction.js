define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="wh-pa-resolveAction" title="'),__append(t("wh","PAGE_ACTION:resolveAction:title")),__append('" autocomplete="off">\n  <div class="input-group">\n    <input name="card" type="text" autocomplete="new-password" class="form-control" placeholder="'),__append(t("wh","PAGE_ACTION:resolveAction:placeholder")),__append('" required pattern="^[0-9]{6,}$" value="">\n    <span class="input-group-btn">\n      <button class="btn btn-default" type="submit"><i class="fa fa-id-card-o"></i></button>\n    </span>\n  </div>\n</form>\n');return __output.join("")}});