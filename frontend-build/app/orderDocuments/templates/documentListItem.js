define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<a class="orderDocuments-document '),__append(search?"is-search":""),__append('" tabindex="0" data-nc15="'),__append(nc15),__append('">\n  <span class="orderDocuments-document-name">'),__append(name),__append('</span>\n  <span class="orderDocuments-document-nc15">'),__append("ORDER"===nc15?"&nbsp;":nc15),__append("</span>\n  "),external&&__append('\n  <button type="button" class="btn btn-link orderDocuments-document-remove" tabindex="-1"><i class="fa fa-remove"></i></button>\n  '),__append("\n  "),search&&__append('\n  <i class="fa fa-search orderDocuments-document-search"></i>\n  '),__append("\n</a>\n");return __output.join("")}});