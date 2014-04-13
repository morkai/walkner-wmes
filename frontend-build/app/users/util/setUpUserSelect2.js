define(["underscore","app/i18n","app/user"],function(e,t,n){return function(r,l){return r.select2(e.extend({openOnEnter:null,allowClear:!0,minimumInputLength:3,placeholder:t("users","select2:placeholder"),ajax:{cache:!0,quietMillis:300,url:function(e){e=e.trim();var t=/^[0-9]+$/.test(e)?"personellId":"lastName";return e=encodeURIComponent("^"+e),"/users?select(personellId,lastName,firstName,login)&sort("+t+")&limit(20)&regex("+t+","+e+",i)"},results:function(e,r){var s=n.getRootUserData(),i=[{id:"$SYSTEM",text:t("users","select2:users:system"),name:t("users","select2:users:system"),login:null},{id:s._id,text:s.name||s.login,name:s.name||s.login,login:s.login,personellId:"-"}].filter(function(e){return-1!==e.text.indexOf(r.term)}),o=i.concat(e.collection||[]);return l.userFilter&&(o=o.filter(l.userFilter)),{results:o.map(function(e){var t=e.lastName&&e.firstName?e.lastName+" "+e.firstName:"-",n=e.personellId?e.personellId:"-";return{id:e._id,text:t+" ("+n+")",name:t,login:e.login,personellId:n}}).sort(function(e,t){return e.text.localeCompare(t.text)})}}}},l))}});