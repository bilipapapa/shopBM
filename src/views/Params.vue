<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片容器 -->
    <el-card class="box-card">
      <!-- 头部警告 -->
      <el-alert :closable="false" title="注意！只允许为第三级分类设置相关参数！" type="warning" show-icon></el-alert>
      <!-- 选择商品区 -->
      <el-row class="casContainer">
        <el-col :span="3">
          <p>选择商品分类：</p>
        </el-col>
        <el-col :span="8">
          <div>
            <el-cascader
              v-model="selectId"
              :options="CatList"
              :props="propsConfig"
              @change="changehandle"
              ref="elcascader"
            ></el-cascader>
          </div>
        </el-col>
      </el-row>
      <!-- tab 页签区 -->
      <el-tabs v-model="activeTabName" @tab-click="tabClick">
        <el-tab-pane :disabled="isBtnDisable" label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            v-preventReClick="1000"
            @click="showAddParamsDialog()"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border="" stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot:default="tags">
                <el-tag closable v-for="(item,i) in tags.row.attr_vals" @close="handleClose(tags.row,i)" :key="item">{{item}}</el-tag>
                <!-- 添加新的可选项tag -->
                <el-input
                  class="input-new-tag"
                  v-if="tags.row.inputVisible"
                  v-model="tags.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="addNewTag(tags.row)"
                  @blur="addNewTag(tags.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(tags.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="data">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  v-preventReClick="1000"
                  @click="showEditPaDialog(data.row)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  v-preventReClick="1000"
                  @click="removePa(data.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane :disabled="isBtnDisable" label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            v-preventReClick="1000"
            @click="addAttrDialogVisible()"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border="" stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot:default="tags">
                <el-tag closable v-for="(item,i) in tags.row.attr_vals" @close="handleClose(tags.row,i)" :key="item">{{item}}</el-tag>
                <!-- 添加新的可选项tag -->
                <el-input
                  class="input-new-tag"
                  v-if="tags.row.inputVisible"
                  v-model="tags.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="addNewTag(tags.row)"
                  @blur="addNewTag(tags.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(tags.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="data">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  v-preventReClick="1000"
                  @click="showEditPaDialog(data.row)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  v-preventReClick="1000"
                  @click="removePa(data.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态参数/静态属性dialog框 -->
    <el-dialog
      :title=" opearText + titleText"
      :visible.sync="addPaDialogVisible"
      width="80%"
      v-preventReClick="1000"
      @closed="addPaClosed"
    >
      <!-- 表单区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button v-preventReClick="1000" @click="addPaDialogVisible = false">取 消</el-button>
        <el-button type="primary" v-preventReClick="1000" @click="addPa">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 分类列表
      CatList: [],
      // 选中的id
      selectId: [],
      // 级联选择器prop配置
      propsConfig: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 激活的页签
      activeTabName: 'many',
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 添加属性dialog框显隐
      addPaDialogVisible: false,
      // addForm
      addForm: {
        attr_name: '',
        attr_sel: '',
        attr_id: '',
        attr_write: '',
        attr_vals: ''
      },
      /* // dialog标题文本
      titleText: '', */
      // dialog标题操作文本
      opearText: '',
      // 表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数内容', trigger: 'blur' },
          { min: 2, max: 12, message: '长度在 2 到 12 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCatList()
  },
  methods: {
    // 获取分类列表
    async getCatList () {
      await this.$http
        .get('categories')
        .then(res => {
          // console.group('分类列表')
          // console.log(res)
          // console.groupEnd('分类列表')
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          this.CatList = res.data.data
        })
        .catch(err => {
          return err
        })
    },
    // 级联选择器选择内容改变事件
    changehandle () {
      if (this.selectId.length !== 3) {
        this.selectId = []
        this.onlyTableData = []
        this.manyTableData = []
        return this.$message.error('只能选择三级分类')
      }
      this.getParamsData()
    },
    // 页签点击事件
    tabClick () {
      this.getParamsData()
    },
    // 获取参数数据
    async getParamsData () {
      // 获取参数数据并保存
      await this.$http
        .get(`categories/${this.catId}/attributes`, {
          params: { sel: this.activeTabName }
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          res.data.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
            // 控制添加可选项tag显示与隐藏
            item.inputVisible = false
            // 添加的tag数据
            item.inputValue = ''
          })
          if (this.activeTabName === 'many') {
            this.manyTableData = res.data.data
          } else {
            this.onlyTableData = res.data.data
          }
        })
        .catch(err => err)
    },
    // 显示添加参数dialog框
    showAddParamsDialog () {
      this.addPaDialogVisible = true
      this.opearText = '添加'
    },
    // 显示添加属性dialog框
    addAttrDialogVisible () {
      this.addPaDialogVisible = true
      this.opearText = '添加'
    },
    // 显示编辑属性dialog框
    showEditPaDialog (row) {
      this.addPaDialogVisible = true
      this.opearText = '编辑'
      this.addForm.attr_name = row.attr_name
      this.addForm.attr_id = row.attr_id
    },
    // 添加参数/属性提交事件
    addPa () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        if (this.opearText === '添加') {
          await this.$http
            .post(`categories/${this.catId}/attributes`, {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeTabName
            })
            .then(res => {
              if (res.data.meta.status !== 201) {
                return this.$message.error(res.data.meta.msg)
              }
              this.$message.success(res.data.meta.msg)
              this.addPaDialogVisible = false
              this.getParamsData()
            })
            .catch(err => err)
        } else {
          await this.$http
            .put(
              `categories/${this.catId}/attributes/${this.addForm.attr_id}`,
              {
                attr_name: this.addForm.attr_name,
                attr_sel: this.activeTabName
              }
            )
            .then(res => {
              if (res.data.meta.status !== 200) {
                return this.$message.error(res.data.meta.msg)
              }
              this.addPaDialogVisible = false
              this.$message.success(res.data.meta.msg)
              this.getParamsData()
            })
            .catch(err => err)
        }
      })
    },
    // 关闭添加属性dialog框事件
    addPaClosed () {
      this.titleAdd = ''
      this.$refs.addFormRef.resetFields()
    },
    // 删除对应参数项
    async removePa (id) {
      this.$confirm('此操作将该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          await this.$http
            .delete(`categories/${this.catId}/attributes/${id}`)
            .then(res => {
              if (res.data.meta.status !== 200) {
                return this.$message.error(this.data.meta.msg)
              }
            })
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getParamsData()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 添加新的可选项事件
    addNewTag (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
      this.$message.success('添加成功')
    },
    // 切换tag标签
    showInput (row) {
      row.inputVisible = true
      // 使新增的tag标签获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 提交可选项tag内容
    async saveAttrVals (row) {
      await this.$http.put(`categories/${this.catId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeTabName,
        attr_vals: row.attr_vals.join(',')
      }).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error(this.data.meta.msg)
        }
      })
        .catch(err => err)
    },
    // 删除可选项tag
    handleClose (row, index) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
      this.$message.success('修改成功')
    }
  },
  computed: {
    // 判断按钮是否需要被禁用 被禁用则为true
    isBtnDisable () {
      if (this.selectId.length !== 3) {
        return true
      }
      return false
    },
    // 三级分类的id
    catId () {
      if (this.selectId.length === 3) {
        return this.selectId[2]
      }
      return null
    },
    // 动态计算标题文本
    titleText () {
      if (this.activeTabName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.casContainer {
  margin: 20px 0;
}
.el-cascader {
  margin-top: 10px;
}
.el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
