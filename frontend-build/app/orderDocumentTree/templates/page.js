define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="orderDocumentTree-page '),__append(uploading?"is-uploading":""),__append('">\n  <div id="'),__append(idPrefix),__append('-foldersContainer" class="orderDocumentTree-folders-container panel panel-default">\n    <div id="'),__append(idPrefix),__append('-folders" class="panel-body"></div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-filesContainer" class="orderDocumentTree-files-container panel panel-default">\n    <div id="'),__append(idPrefix),__append('-path" class="panel-heading orderDocumentTree-path-container"></div>\n    <div id="'),__append(idPrefix),__append('-toolbar" class="panel-body"></div>\n    <div id="'),__append(idPrefix),__append('-files" class="panel-body"></div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-uploadContainer" class="orderDocumentTree-uploads-container"></div>\n</div>\n');return __output.join("")}});