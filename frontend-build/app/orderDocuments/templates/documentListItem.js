define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(u){return void 0==u?"":String(u).replace(_MATCH_HTML,function(u){return _ENCODE_HTML_RULES[u]||u})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<a class="orderDocuments-document" tabindex="0" data-nc15="'),__output.push(nc15),__output.push('">\n  <span class="orderDocuments-document-name">'),__output.push(name),__output.push('</span>\n  <span class="orderDocuments-document-nc15">'),__output.push(nc15),__output.push("</span>\n</a>");return __output.join("")}});