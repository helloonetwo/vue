import  Vue  from  'vue'
import  VueRouter  from  'vue-router'
import  Home  from  '../pages/Home/Home.vue'
import  Search  from  '../pages/Search/Search.vue'
import  Order  from  '../pages/Order/Order.vue'
import  Person  from  '../pages/Person/Person.vue'
import  Login  from  '../pages/Login/Login.vue'
Vue.use(VueRouter)


export  default  new  VueRouter({
   routes:  [
       {
       path:  '/', redirect:  '/home'
       },
       {
        path:  '/home', component:  Home,
       },
       {
       path:  '/search', component:  Search,
       },
       {
       path:  '/order', component:  Order,
       },
       {
       path:  '/person', component:  Person,
       },
       {
       path:  '/login', component: Login,
       }
       ]
})
