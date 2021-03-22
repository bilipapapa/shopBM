<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/vue_logo.png" alt="" title="头像">
      </div>
      <!-- 登录表单 -->
      <el-form
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
        label-width="0"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form class="btns">
          <el-button class="form-btn" @click="login" type="primary">登录</el-button>
          <el-button class="form-btn" @click="reset" type="info">重置</el-button>
        </el-form>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      /* 表单验证规则 */
      loginFormRules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { min: 3, max: 12, message: '用户名在3到12个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度在6-16个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    /* 登录事件 */
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) {
          this.$message.error(`登录失败,${res.meta.msg}`)
        } else {
          this.$message.success('登录成功!')
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('home')
        }
      })
    },
    /* 重置按钮 */
    reset () {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  position: relative;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  background-color: rgb(17, 252, 68);
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 1px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -35%);
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.login_form {
  width: 90%;
  margin: 0 auto;
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translate(-50%, 0);
}
.btns {
  display: flex;
  justify-content: space-around;
}
.form-btn {
  width: 100px;
}
</style>
