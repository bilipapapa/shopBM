<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>权限列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片 -->
		<el-card>
			<el-table :data="rightsList" border stripe>
				<el-table-column label="#" type="index"></el-table-column>
				<el-table-column label="权限名称" prop="authName"></el-table-column>
				<el-table-column label="路径" prop="path"></el-table-column>
				<el-table-column label="权限等级" prop="level">
					<template slot-scope="scope">
						<el-tag v-if="scope.row.level == 0">一级</el-tag>
						<el-tag v-if="scope.row.level == 1" type="success">二级</el-tag>
						<el-tag v-if="scope.row.level == 2" type="warning">三级</el-tag>
					</template>
				</el-table-column>
			</el-table>
		</el-card>
	</div>
</template>

<script>
export default {
  data () {
    return {
      // 权限列表
      rightsList: []
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // this.$message.success(res.meta.msg)
      this.rightsList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
	.el-tag {
		width: 25%;
		text-align: center;
	}
</style>
