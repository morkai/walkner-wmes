define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,function(e){return _ENCODE_HTML_RULES[e]||e})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="orderDocuments-preview">\n  <iframe id="'),__output.push(idPrefix),__output.push('-iframe" class="orderDocuments-preview-iframe" src=""></iframe>\n  <div id="'),__output.push(idPrefix),__output.push('-loading" class="orderDocuments-preview-loading hidden">\n    <i class="fa fa-spinner fa-spin"></i>\n    <span id="'),__output.push(idPrefix),__output.push('-message"></span>\n  </div>\n</div>');return __output.join("")}});