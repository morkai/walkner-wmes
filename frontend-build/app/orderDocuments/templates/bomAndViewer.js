define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="orderDocuments-bomAndViewer">\n  <div id="'),__append(id("bom")),__append('" class="orderDocuments-bomAndViewer-bom"><i class="fa fa-spinner fa-spin"></i></div>\n  <div class="orderDocuments-bomAndViewer-viewer">\n    <iframe id="'),__append(id("iframe")),__append('" src=""></iframe>\n  </div>\n  <div class="cancel"><i class="fa fa-times"></i></div>\n</div>\n');return __output}});