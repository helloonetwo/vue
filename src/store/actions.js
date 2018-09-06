import {
  RECEIVE_SHOPS,
  RECEIVE_ADDRESS,
  RECEIVE_CATEGORYS
}  from './mutation-types'
//引入接口
import {
  reqFoodCategorys,
  reqAddress,
  reqShops
}from  '../api'
//定义3个action
export default {
   //异步获取地址
   async   getAddress({commit,state}) {
     //发送异步请求
     const geohash=state.latitude+','+state.longitude,
    const result=await  reqAddress(geohash);
    if(result.code===0) {
       const address=result.data;
       commit(RECEIVE_ADDRESS,{address})
    }
     //提交一个mutation
   },
   //异步获取商家列表
   async getShops({commit,state}) {
     const {longitude,latitude }=state;
      const  result=await   reqShops(longitude,latitude);
      if(result.code===0) {
         const shops=result.data;
         commit(RECEIVE_SHOPS,{shops})
      }
   }
   //异步获取商家列表
   async getCategorys({commit,state}) {
      const  result=await   reqFoodCategorys();
      if(result.code===0) {
         const categorys=result.data;
         commit(RECEIVE_CATEGORYS,{categorys})
      }
   }
}
