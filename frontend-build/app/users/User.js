define(["../core/Model"],function(e){return e.extend({urlRoot:"/users",clientUrlRoot:"#users",topicPrefix:"users",privilegePrefix:"USERS",nlsDomain:"users",labelAttribute:"login",defaults:{login:null,email:null,prodFunction:"unspecified",privileges:null,aors:null,company:null,kdDivision:null,personellId:null,card:null,firstName:null,lastName:null,registerDate:null,kdPosition:null,active:!0},initialize:function(){Array.isArray(this.get("privileges"))||this.set("privileges",[]),Array.isArray(this.get("aors"))||this.set("aors",[])},getLabel:function(){var e=this.get("lastName")||"",l=this.get("firstName")||"";return e.length&&l.length?e+" "+l:this.get("login")}})});