<template>
	<div>
		<!-- 面包屑导航区 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片区 -->
		<el-card class="box-card">
			<el-row :gutter="20">
				<!-- 搜索区 -->
				<el-col :span="8">
					<el-input clearable @clear="getGoodsList" v-model="queryInfo.query" placeholder="请输入内容">
						<el-button @click="getGoodsList" slot="append" icon="el-icon-search"></el-button>
					</el-input>
				</el-col>
				<!-- 添加按钮 -->
				<el-col :span="4">
					<el-button type="primary" @click="showAddDialog">添加商品</el-button>
				</el-col>
			</el-row>
			<!-- 表格区 -->
			<el-table :data="goodsList" border="" stripe :empty-text="empText">
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column prop="goods_name" label="商品名称"></el-table-column>
				<el-table-column prop="goods_price" label="商品价格（元）" width="120"></el-table-column>
				<el-table-column prop="goods_weight" label="商品重量" width="100"></el-table-column>
				<el-table-column prop="add_time" label="创建时间" width="160">
					<template v-slot:default="date">{{date.row.add_time | dateFormat}}</template>
				</el-table-column>
				<el-table-column label="操作" width="140">
					<template v-slot:default="data">
						<el-button
							type="primary"
							icon="el-icon-edit"
							size="mini"
							@click="showEditDialog(data.row.goods_id)"
						></el-button>
						<el-button @click="removeGoods(data.row.goods_id)" type="danger" icon="el-icon-delete" size="mini"></el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 页码区 -->
			<div class="block">
				<el-pagination
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
					:current-page="queryInfo.pagenum"
					:page-sizes="[5, 8, 10, 20]"
					:page-size="queryInfo.pagesize"
					layout="total, sizes, prev, pager, next, jumper"
					:total="total"
				></el-pagination>
			</div>
			<!-- 添加商品dialog框 -->
			<el-dialog
				title="添加商品"
				:visible.sync="addGoodsDialogVisible"
				width="50%"
				@closed="addDialogClosed"
			>
				<!-- dialog表单区 -->
				<el-form :model="addGoodsInfo" :rules="rules" ref="addRefs">
					<el-form-item label-width="145px" label="商品名称：" prop="goods_name">
						<el-input v-model="addGoodsInfo.goods_name"></el-input>
					</el-form-item>
					<el-form-item label-width="145px" label="商品分类：" prop="goods_cat">
						<el-cascader
							v-model="addGoodsInfo.goods_cat"
							:options="catList"
							:props="propsConfig"
							@change="changehandle"
							ref="elcascader"
						></el-cascader>
					</el-form-item>
					<el-form-item label-width="145px" label="商品价格（元）：" prop="goods_price">
						<el-input v-model="addGoodsInfo.goods_price"></el-input>
					</el-form-item>
					<el-form-item label-width="145px" label="商品数量：" prop="goods_number">
						<el-input v-model.number="addGoodsInfo.goods_number"></el-input>
					</el-form-item>
					<el-form-item label-width="145px" label="商品重量（KG）：" prop="goods_weight">
						<el-input v-model="addGoodsInfo.goods_weight"></el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="addGoodsDialogVisible = false">取 消</el-button>
					<el-button type="primary" v-preventReClick="1000" @click="addGoods">确 定</el-button>
				</span>
			</el-dialog>
			<!-- 修改商品dialog框 -->
			<el-dialog
				title="编辑"
				:visible.sync="editGoodsDialogVisible"
				width="50%"
				@closed="editDialogClosed"
			>
				<!-- dialog表单区 -->
				<el-form :model="editGoodsInfo" :rules="rules" ref="editRefs">
					<el-form-item label-width="145px" label="商品名称：" prop="goods_name">
						<el-input v-model="editGoodsInfo.goods_name"></el-input>
					</el-form-item>
					<!-- <el-form-item label-width="145px" label="商品分类：" prop="goods_cat">
						<el-cascader
							v-model="editGoodsInfo.goods_cat"
							:options="catList"
							:props="propsConfig"
							@change="editChangehandle"
							ref="cascader"
						></el-cascader>
					</el-form-item>-->
					<el-form-item label-width="145px" label="商品价格（元）：" prop="goods_price">
						<el-input v-model="editGoodsInfo.goods_price"></el-input>
					</el-form-item>
					<el-form-item label-width="145px" label="商品数量：" prop="goods_number">
						<el-input v-model.number="editGoodsInfo.goods_number"></el-input>
					</el-form-item>
					<el-form-item label-width="145px" label="商品重量（KG）：" prop="goods_weight">
						<el-input v-model="editGoodsInfo.goods_weight"></el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="editGoodsDialogVisible = false">取 消</el-button>
					<el-button type="primary" v-preventReClick="1000" @click="editGoods">确 定</el-button>
				</span>
			</el-dialog>
		</el-card>
	</div>
</template>

<script>
export default {
  data () {
    // 添加验证规则
    const priceCheck = (rule, value, cb) => {
      // 价格格式校验
      const priceReg = /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/
      if (!priceReg.test(value)) {
        return cb(new Error('请输入正确的价格格式'))
      }
      cb()
    }
    const weightCheck = (rule, value, cb) => {
      // 重量格式校验
      const weightReg = /(^[1-9]\d*(\.\d{1,3})?$)|(^0(\.\d{1,3})?$)/
      if (!weightReg.test(value)) {
        return cb(new Error('请输入正确的重量格式'))
      }
      cb()
    }
    return {
      // 获取商品列表查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 8
      },
      // 商品列表数据
      goodsList: [],
      // 表格数据为空时提示文本
      empText: '加载中',
      // 商品总数量
      total: 0,
      // 搜索框文本
      inputVal: '',
      // 添加商品dialog框显隐
      addGoodsDialogVisible: false,
      // 添加商品的资料
      addGoodsInfo: {
        goods_name: '',
        goods_cat: [],
        goods_price: '',
        goods_number: '',
        goods_weight: ''
      },
      // 编辑商品的资料
      editGoodsInfo: {},
      // 表单验证规则
      rules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 2, max: 100, message: '长度不能小于2个字符', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { validator: priceCheck, trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '数量不能为空' },
          { type: 'number', message: '数量必须为数字值' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { validator: weightCheck, trigger: 'blur' }
        ]
      },
      // 商品分类信息,
      catList: [],
      // cascader组件配置属性
      propsConfig: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 编辑商品dialog框
      editGoodsDialogVisible: false
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表数据
    async getGoodsList () {
      this.$http.get('goods', { params: this.queryInfo }).then(res => {
        if (res.data.meta.status !== 200) {
          this.empText = '暂无数据'
          return this.$message.error(res.data.meta.msg)
        }
        this.goodsList = res.data.data.goods
        this.total = res.data.data.total
      })
    },
    // 每页显示数目变化
    handleSizeChange (size) {
      this.queryInfo.pagesize = size
      this.getGoodsList()
    },
    // 当前页码数改变事件
    handleCurrentChange (num) {
      this.queryInfo.pagenum = num
      this.getGoodsList()
    },
    // 展示添加商品dialog框
    showAddDialog () {
      this.addGoodsDialogVisible = true
      this.getCateList()
    },
    // 获取分类信息
    async getCateList () {
      await this.$http
        .get('categories')
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          this.catList = res.data.data
        })
        .catch(err => {
          return err
        })
    },
    // cascader组件change事件
    changehandle () {
      this.$refs.elcascader.dropDownVisible = false
    },
    // 添加商品dialog框关闭事件
    addDialogClosed () {
      this.$refs.addRefs.resetFields()
      this.addGoodsInfo.goods_cat = []
    },
    // 添加商品提交事件
    addGoods () {
      this.$refs.addRefs.validate(async valid => {
        if (!valid) {
          return
        }
        this.addGoodsInfo.goods_cat = this.addGoodsInfo.goods_cat.join(',')
        await this.$http
          .post('goods', this.addGoodsInfo)
          .then(res => {
            if (res.data.meta.status !== 201) {
              return this.$message.error(res.data.meta.msg)
            }
            this.$message.success(res.data.meta.msg)
            this.getGoodsList()
            this.addGoodsDialogVisible = false
          })
          .catch(err => err)
      })
    },
    // 展示编辑商品dialog框
    async showEditDialog (id) {
      // this.editGoodsInfo = row
      await this.$http
        .get(`goods/${id}`)
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          this.editGoodsInfo = res.data.data
        })
        .catch(err => err)
      this.editGoodsDialogVisible = true
    },
    editChangehandle () {
      this.$refs.cascader.dropDownVisible = false
    },
    // 编辑dialog框提交事件
    editGoods () {
      this.$refs.editRefs.validate(async valid => {
        if (!valid) {
          return
        }
        await this.$http
          .put(`goods/${this.editGoodsInfo.goods_id}`, this.editGoodsInfo)
          .then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error(res.data.meta.msg + 111)
            }
            this.$message.success('修改成功')
            this.editGoodsDialogVisible = false
            this.getGoodsList()
          })
          .catch(err => err)
      })
    },
    // 关闭dialog框
    editDialogClosed () {
      this.$refs.editRefs.resetFields()
    },
    // 移除商品
    async removeGoods (id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          await this.$http.delete(`goods/${id}`)
            .then(res => {
              if (res.data.meta.status !== 200) {
                return this.$message.error(res.data.meta.msg)
              }
              this.$message.success(res.data.meta.msg)
              this.getGoodsList()
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 300px;
}
</style>
