define(["../core/Collection","./PressWorksheet"],function(e,t){return e.extend({model:t,rqlQuery:"exclude(orders,operators)&sort(-createdAt)&limit(15)"})});