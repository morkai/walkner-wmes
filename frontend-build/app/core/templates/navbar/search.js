define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(a){return _ENCODE_HTML_RULES[a]||a}escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form id="'),__append(idPrefix),__append('-search" class="navbar-form navbar-right navbar-search" autocomplete="off">\n  <div class="form-group has-feedback">\n    <input id="'),__append(idPrefix),__append('-searchPhrase" type="text" class="form-control navbar-search-phrase">\n    <span class="fa fa-search form-control-feedback"></span>\n  </div>\n  <ul id="'),__append(idPrefix),__append('-searchResults" class="dropdown-menu navbar-search-results"></ul>\n</form>\n');return __output.join("")}});