define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="page-actions-jump" title="'),__output.push(t(nlsDomain,"PAGE_ACTION:jump:title")),__output.push('">\n  <div class="input-group">\n    <input name="rid" type="text" class="form-control" placeholder="'),__output.push(t(nlsDomain,"PAGE_ACTION:jump:placeholder")),__output.push('" required autofocus pattern="^ *[0-9]+ *$">\n    <span class="input-group-btn">\n      <button class="btn btn-default" type="submit"><i class="fa fa-search"></i></button>\n    </span>\n  </div>\n</form>\n');return __output.join("")}});