define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<table class="prodShifts-timeline-popover">\n  '),managing&&buf.push('\n  <tfoot>\n    <tr>\n      <td colspan="2"><button class="btn btn-block btn-danger prodShifts-timeline-editDowntime">',t("prodShifts","timeline:action:editDowntime"),'</button></td>\n    </tr>\n    <tr>\n      <td colspan="2"><button class="btn btn-block btn-',hasOrder?"success":"warning",' prodShifts-timeline-deleteDowntime">',t("prodShifts","timeline:action:deleteDowntime"),"</button></td>\n    </tr>\n  </tfoot>\n  "),buf.push("\n  <tbody>\n    <tr>\n      <th>",t("prodShifts","timeline:popover:startedAt"),"</th>\n      <td>",startedAt,"</td>\n    </tr>\n    <tr>\n      <th>",t("prodShifts","timeline:popover:finishedAt"),"</th>\n      <td>",finishedAt,"</td>\n    </tr>\n    <tr>\n      <th>",t("prodShifts","timeline:popover:duration"),"</th>\n      <td>",duration,"</td>\n    </tr>\n    <tr>\n      <th>",t("prodShifts","timeline:popover:reason"),"</th>\n      <td>",reason,"</td>\n    </tr>\n    <tr>\n      <th>",t("prodShifts","timeline:popover:aor"),"</th>\n      <td>",aor,"</td>\n    </tr>\n  </tbody>\n</table>\n")}();return buf.join("")}});