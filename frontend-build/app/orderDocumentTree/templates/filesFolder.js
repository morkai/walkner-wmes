define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="orderDocumentTree-files-item orderDocumentTree-files-folder" data-id="'),__append(folder.id),__append('">\n  <span class="orderDocumentTree-files-icon"><i class="fa '),__append(folder.icon),__append('"></i></span>\n  <span class="orderDocumentTree-files-label">'),__append(escapeFn(folder.label)),__append("</span></span>\n</div>\n");return __output.join("")}});