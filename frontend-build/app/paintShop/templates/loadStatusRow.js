define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(t){return _ENCODE_HTML_RULES[t]||t}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr>\n  <td class="is-min"><input data-property="from" class="form-control" type="number" min="0" placeholder="0" value="'),__append(status.from),__append('"></td>\n  <td class="is-min"><input data-property="to" class="form-control" type="number" min="0" value="'),__append(status.to),__append('"></td>\n  <td class="is-min">\n    <select data-property="icon" class="form-control" style="width: 125px;">\n      '),["smile-o","meh-o","frown-o","thumbs-up","thumbs-down","bell-o","bolt","question","exclamation","info","check","times","level-up","level-down","star","star-o","star-half-o"].forEach(function(t){__append('\n      <option value="'),__append(t),__append('" '),__append(t===status.icon?"selected":""),__append(">"),__append(t),__append("</option>\n      ")}),__append('\n    </select>\n  </td>\n  <td class="is-min"><i data-bg="light" class="fa fa-'),__append(status.icon),__append('" style="color: '),__append(status.color),__append('"></i>&nbsp;&nbsp;<i data-bg="dark" class="fa fa-'),__append(status.icon),__append('" style="color: '),__append(status.color),__append('"></i></td>\n  <td class="is-min">\n    <div class="input-group colorpicker-component" data-color="'),__append(status.color),__append('" data-color-format="hex">\n      <input class="form-control" data-property="color" type="text" autocomplete="new-password" value="'),__append(status.color),__append('">\n      <span class="input-group-addon"><i style="background-color: '),__append(status.color),__append('"></i></span>\n    </div>\n  </td>\n  <td></td>\n  <td class="actions">\n    <div class="actions-group">\n      <button data-status-action="remove" class="btn btn-default" type="button"><i class="fa fa-remove"></i></button>\n    </div>\n  </td>\n</tr>\n');return __output.join("")}});