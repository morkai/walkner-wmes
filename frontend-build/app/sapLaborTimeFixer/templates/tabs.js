define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="sapLaborTimeFixer-xData-tabs">\n  <div id="'),__append(idPrefix),__append('-workCenters" class="sapLaborTimeFixer-xData-tabs-workCenters">\n    <ul class="nav nav-tabs">\n      '),workCenters.forEach(function(n){__append('\n      <li class="'),__append(n.active),__append('"><a href="#" data-work-center="'),__append(escapeFn(n._id)),__append('">'),__append(escapeFn(n.label)),__append("</a></li>\n      ")}),__append('\n    </ul>\n  </div>\n  <div id="'),__append(idPrefix),__append('-deps" class="sapLaborTimeFixer-xData-tabs-deps '),__append(deps.length?"":"hidden"),__append('">\n    <ul class="nav nav-pills">\n      '),deps.forEach(function(n){__append('\n      <li class="'),__append(n.active),__append('"><a href="#" data-deps="'),__append(escapeFn(n._id)),__append('">'),__append(escapeFn(n.label)),__append("</a></li>\n      ")}),__append("\n    </ul>\n  </div>\n</div>\n");return __output.join("")}});