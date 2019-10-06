define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-'),__append(model.className),__append('">\n  <div class="panel-heading">\n    '),__append(panelTitle),__append('\n  </div>\n  <div class="panel-details row">\n    <div class="col-md-4">\n      '),__append(helpers.props(model,["status","type","name",{id:"sn",valueClassName:"text-mono"}])),__append('\n    </div>\n    <div class="col-md-4">\n      '),__append(helpers.props(model,["interval","lastDate","nextDate","remaining"])),__append('\n    </div>\n    <div class="col-md-4">\n      '),__append(helpers.props(model,[{id:"!certificateFile",value:function(e){return e?'<a href="'+model.url+'/attachments/certificate" target="_blank">'+_.escape(e.name)+"</a>":t("FORM:attachment:empty")}},"!individualUsers","!currentUsers"])),__append("\n    </div>\n  </div>\n</div>\n");return __output.join("")}});