<template>
  <div class="my-child">
    <h3>我是子组件</h3>
    <p>子组件的年龄是：{{childAge}}</p>
    <h5>我是子组件，我可以通过属性props来接收父组件传过来的年龄值是：{{deliverParentAge}}</h5>
    <h5>并且，我要告诉他，他今年生日已经过了，所以他的年龄应该<button @click="AddAge">加1</button></h5>
  </div>
</template>

<script>
export default {
  data () {
    return {
      childAge: 27
    }
  },
  props: {
    deliverParentAge: Number
  },
  methods: {
    AddAge () {
      this.$emit('addParentAge', this.deliverParentAge + 1)
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
