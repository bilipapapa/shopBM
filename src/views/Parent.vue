<template>
  <div class="my-parent">
    <h3>我是父组件，我想告诉我的子组件，我的年龄值是:{{parentAge}}</h3>
    <h3>我要通过v-bind(即简写":")语法糖绑定一个属性deliverParentAge，将父组件的值传递到子组件中</h3>
    <!-- 下面就是我的子组件 -->
    <my-child :deliverParentAge="parentAge" @addParentAge='handleAddParentAge'></my-child>
  </div>
</template>

<script>

import MyChild from './Child'

export default {
  components: {
    MyChild
  },
  data () {
    return {
      childAge: 27,
      parentAge: 55
    }
  },
  methods: {
    handleAddParentAge (age) {
      this.parentAge = age
    }
  }
}
</script>

<style>
.my-child {
  margin: 20px;
  width: 760px;
  height: 200px;
  border: 1px solid red;
}
</style>
