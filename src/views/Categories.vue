<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator="/">
			<el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片区 -->
		<el-card class="box-card">
			<!-- 添加分类按钮 -->
			<el-row>
				<el-col>
					<el-button type="primary" @click="addCategoriesDialogVisible=true ;getParentCate()">添加分类</el-button>
				</el-col>
			</el-row>
			<!-- 商品分类表格 -->
			<tree-table
				class="table"
				:data="cateList"
				:empty-text="emptyText"
				:selection-type="false"
				:expand-type="false"
				:row-key="cateList.cat_id"
				show-index
				index-text="#"
				border=""
				:columns="columns"
			>
				<!-- 是否有效列 -->
				<template v-slot:isOk="scoped">
					<i class="el-icon-success" style="color: lightgreen" v-if="scoped.row.cat_deleted===false "></i>
					<i class="el-icon-error" style="color: red" v-else></i>
				</template>
				<!-- 排序列 -->
				<template v-slot:sort="scoped">
					<el-tag size="mini" v-if="scoped.row.cat_level===0">一级</el-tag>
					<el-tag size="mini" type="success" v-if="scoped.row.cat_level===1">二级</el-tag>
					<el-tag v-if="scoped.row.cat_level===2" size="mini" type="danger">三级</el-tag>
				</template>
				<!-- 操作列 -->
				<template v-slot:operate="scoped">
					<el-button icon="el-icon-edit" size="mini" type="primary">编辑</el-button>
					<el-button icon="el-icon-delete" size="mini" type="danger">删除</el-button>
					<span>{{scoped.row.cateTotal}}</span>
				</template>
			</tree-table>
			<!-- 页码区域 -->
			<div class="block">
				<el-pagination
					@size-change="pageSizeChange"
					@current-change="handleCurrentChange"
					:page-sizes="[5,8,10,20]"
					:page-size="5"
					layout="total, sizes, prev, pager, next, jumper"
					:total="cateTotal"
				></el-pagination>
			</div>
			<!-- 添加分类dialog框 -->
			<el-dialog title="添加分类" :visible.sync="addCategoriesDialogVisible" width="50%"
			@closed="addCategoriesDialogClosed">
				<!-- 表单区 -->
				<el-form :rules="rules" ref="addCateFormRef" label-width="80px" :model="addCateForm">
					<el-form-item label="分类名称" prop="cat_name">
						<el-input v-model="addCateForm.cat_name"></el-input>
					</el-form-item>
					<el-form-item label="父级分类">
						<!-- 选择父级 级联选择器 -->
						<div class="block">
							<el-cascader
								v-model="selectedIds"
								:options="parentCateList"
								:props="cascaderProps"
								@change="cascaderChange"
								style="width: 100%"
								clearable
								ref="elcascader"
							></el-cascader>
						</div>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="addCategoriesDialogVisible = false">取 消</el-button>
					<el-button v-preventReClick="1000" type="primary" @click="addCate">确 定</el-button>
				</span>
			</el-dialog>
		</el-card>
	</div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 获取分类列表请求的查询参数
      queryInfo: {
        type: '3',
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类总数
      cateTotal: 0,
      // 表格行配置
      columns: [
        {
          label: '分类',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          // 定义模板列
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operate'
        }
      ],
      // empty-text 表格数据为空时显示的文字
      emptyText: '加载中...',
      // 添加分类dialog框显隐
      addCategoriesDialogVisible: false,
      // 添加分类信息
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 表单验证规则
      rules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 20,
            message: '分类名称长度为2-20',
            trigger: 'blur'
          }
        ]
      },
      // 父类分类列表
      parentCateList: [],
      // 级联选择器组件配置
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选中的id
      selectedIds: []
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品信息
    async getGoodsList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.emptyText = '暂无数据'
        return this.$message.error(res.meta.msg)
      }
      this.cateList = res.data.result
      this.cateTotal = res.data.total
    },
    // 每页显示条数改变事件
    pageSizeChange (pageSize) {
      this.queryInfo.pagesize = pageSize
      this.getGoodsList()
    },
    // 当前页数改变事件
    handleCurrentChange (currentPage) {
      this.queryInfo.pagenum = currentPage
      this.getGoodsList()
    },
    // 添加分类提交事件
    addCate () {
      this.$refs.addCateFormRef.validate(async validate => {
        if (!validate) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.getGoodsList()
        this.addCategoriesDialogVisible = false
      })
    },
    // 获取父级分类
    async getParentCate () {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.parentCateList = res.data
    },
    // 选择内容变化事件
    cascaderChange () {
      this.$refs.elcascader.dropDownVisible = false
      if (this.selectedIds.length > 0) {
        this.addCateForm.cat_pid = this.selectedIds[this.selectedIds.length - 1]
        this.addCateForm.cat_level = this.selectedIds.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 关闭添加分类dialog框事件
    addCategoriesDialogClosed () {
      this.selectedIds = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_name = ''
      this.$refs.addCateFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
body {
  font-family: '微软雅黑';
}
.table {
  font-size: 14px;
  margin: 20px 0;
}

</style>
