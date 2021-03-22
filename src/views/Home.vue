<template>
  <el-container class="home-container">
    <!-- 头部区 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="" title="LOGO">
        <h3>后台管理</h3>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边区 -->
      <el-aside :width="collapse ? '64px' : '200px'">
        <div class="toggleButton" @click="toggleCollapse">{{collapseIcon}}</div>
        <el-menu
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#409eff"
        :unique-opened="true"
        :collapse="collapse"
        :collapse-transition="false"
        :default-active="activeItem"
        router>
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''"
          v-for="item in menuList"
          :key="item.id">
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index=" '/' + item2.path"
            v-for="item2 in item.children"
            :key="item2.id"
            @click="saveNavItem('/' + item2.path)">
              <!-- 图标 -->
              <i class="el-icon-menu"></i>
              <!-- 文本 -->
              <span slot="title">{{item2.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-container>
        <!-- 主题区 -->
        <el-main>
          <!-- 占位符 -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
    <footer>footer</footer>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menuList: [],
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠
      collapse: false,
      collapseIcon: '→||←',
      // 当前激活的选项
      activeItem: ''
    }
  },
  created () {
    this.getMenuList()
    this.activeItem = window.sessionStorage.getItem('activeItem')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 水平折叠左侧菜单
    toggleCollapse () {
      this.collapse = !this.collapse
      if (this.collapse) {
        this.collapseIcon = '|←→|'
      } else {
        this.collapseIcon = '→||←'
      }
    },
    // 保存激活的菜单选项
    saveNavItem (item) {
      this.activeItem = item
      window.sessionStorage.setItem('activeItem', this.activeItem)
    }
  }

}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  div {
    display: flex;
    align-items: center;
  }
  img {
    width: 50px;
  }
  h3 {
    margin: 20px;
    color: #ddd;
    font-size: 20px;
  }
}
.home-container {
  height: 100%;
}
.toggleButton {
  background-color: #bbb;
  font-size: 16px;
  line-height: 30px;
  height: 30px;
  cursor: pointer;
  text-align: center;
}
.el-aside {
  background: #333734;
  transition: width 0.5s;
  .el-menu {
    border: 0;
  }
}
.el-main {
  background: #defdde;
}
.iconfont {
  margin-right: 8px;
}
footer {
  height: 8%;
  background-color: #d5d5d5;
}
</style>
