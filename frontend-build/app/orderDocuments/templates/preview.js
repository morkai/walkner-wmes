define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="orderDocuments-preview">\n  <iframe id="'),__append(idPrefix),__append('-iframe" class="orderDocuments-preview-iframe" src=""></iframe>\n  <div id="'),__append(idPrefix),__append('-loading" class="orderDocuments-preview-loading hidden">\n    <i class="fa fa-spinner fa-spin"></i>\n    <span id="'),__append(idPrefix),__append('-message"></span>\n  </div>\n</div>');return __output.join("")}});