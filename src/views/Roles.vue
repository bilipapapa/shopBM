<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{path: '/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button @click="addRoleDialogVisible = true" type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表table展示区 -->
      <keep-alive include="roleTable">
        <el-table :data="roleList" border="" stripe name="roleTable">
          <!-- 展开列 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row
                :class="['col_bottom',index1 == 0 ? 'col_top' : '','flex_align_center']"
                v-for="(item1,index1) in scope.row.children"
                :key="item1.id"
              >
                <!-- 渲染一级权限 -->
                <el-col class="auth_common" :span="5">
                  <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二级和三级权限 -->
                <el-col :span="18">
                  <el-row
                    v-for="(item2, index2) in item1.children"
                    :key="item2.id"
                    :class="[index2 === 0 ? '' : 'col_top','flex_align_center']"
                  >
                    <!-- 二级权限 -->
                    <el-col :span="6">
                      <el-tag
                        type="success"
                        class="auth_common"
                        closable
                        @close="removeRightById(scope.row, item2.id)"
                      >{{item2.authName}}</el-tag>
                      <i v-if="item2.children.length > 0" class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 三级权限 -->
                    <el-col :span="18">
                      <el-tag
                        v-for="(item3) in item2.children"
                        type="warning"
                        class="auth_common"
                        closable
                        @close="removeRightById(scope.row, item3.id)"
                        :key="item3.id"
                      >{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <!-- 索引列 -->
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              >编辑</el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="showDeleteDialog(scope.row)"
              >删除</el-button>
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRight(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </keep-alive>
    </el-card>
    <!-- 添加角色弹出框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @closed="addRoleDialogClosed"
    >
      <el-form label-width="80px" :model="addRoleForm" :rules="roleRules" ref="addRoleFormRef">
        <el-form-item label="角色名称" prop="addRoleName">
          <el-input v-model="addRoleForm.addRoleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button v-preventReClick="1000" type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色dialog框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @closed="editRoleDialogClosed()"
    >
      <el-form label-width="80px" :model="roleForm" :rules="roleRules" ref="editRoleFormRef">
        <el-form-item label="角色ID" prop="roleId">
          <el-input v-model="roleForm.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 删除角色dialog框 -->
    <el-dialog title="删除角色" :visible.sync="deleteRoleDialogVisible" width="30%">
      <span>
        是否删除角色&nbsp;
        <span class="deleteRoleColor">{{roleForm.roleName}}</span>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" v-preventReClick="1000" @click="deleteRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色权限dialog框 -->
    <el-dialog title="分配角色权限" :visible.sync="setRightDialogVisible" width="30%">
      <el-tree ref="treeRef" :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys='defChecked'></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button @click="setRight" type="primary" v-preventReClick="1000">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证角色名称的规则
    // 添加角色的名称验证
    var checkAddRoleName = (rule, value, cb) => {
      const regRoleName = /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/
      if (value.length > 21 || value.length < 2) {
        return cb(new Error('角色名称长度在2-20字符'))
      } else if (!regRoleName.test(value)) {
        return cb(new Error('不能以字符开头或结尾，且不能有特殊字符'))
      } else if (
        this.roleNameList.some(item => {
          return item === value
        })
      ) {
        return cb(new Error('已拥有相同角色名称'))
      }
      cb()
    }
    // 编辑角色的名称验证
    var checkEditRoleName = (rule, value, cb) => {
      const regRoleName = /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/
      var selfFlag = false
      if (value.length > 21 || value.length < 2) {
        return cb(new Error('角色名称长度在3-20字符'))
      } else if (!regRoleName.test(value)) {
        return cb(new Error('不能以字符开头或结尾，且不能有特殊字符'))
      } else if (
        this.roleNameList.some(item => {
          // 检验重复角色名称排除自身
          if (item === value && selfFlag === false) {
            selfFlag = true
            return false
          }
          return item === value
        })
      ) {
        selfFlag = false
        return cb(new Error('已拥有相同角色名称'))
      }
      cb()
    }
    return {
      // 所有角色列表数据
      roleList: [],
      // 所有角色名称,
      roleNameList: [],
      // 添加角色按钮弹出框显隐
      addRoleDialogVisible: false,
      // 编辑角色弹出框显隐
      editRoleDialogVisible: false,
      // 删除角色弹出框显隐
      deleteRoleDialogVisible: false,
      // 分配角色权限弹出框显隐
      setRightDialogVisible: false,
      // 添加角色的数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 角色数据
      roleForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      // 角色数据规则
      roleRules: {
        addRoleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          } /* {            min: 2,            max: 20,            message: '角色名称长度在4-20之间',            trigger: 'blur'					} */,
          { validator: checkAddRoleName, trigger: 'blur' }
        ],
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          } /* {            min: 2,            max: 20,            message: '角色名称长度在4-20之间',            trigger: 'blur'					} */,
          { validator: checkEditRoleName, trigger: 'blur' }
        ]
        /* roleId: [{ required: true, message: '角色ID不能为空', trigger: 'blur' }] */
      },
      // 所有权限数据
      rightsList: [],
      // tree空间绑定属性
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认勾选的权限id
      defChecked: [],
      // 当前角色id
      roleId: '',
      a: ''
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 获取所有角色列表数据
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      // console.log(JSON.stringify(res))
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
      }
      this.roleList = res.data
      // this.$message.success(res.meta.msg)
      // 将所有角色名放入roleNameList
      this.roleList.forEach(item => {
        item.roleName === '' || null
          ? this.a = 1
          : this.roleNameList.push(item.roleName)
      })
      this.a = null
    },
    // 添加角色的dialog框关闭事件
    addRoleDialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 提交添加角色按钮事件
    addRole () {
      this.$refs.addRoleFormRef.validate(async validate => {
        if (!validate) return

        const { data: res } = await this.$http.post('roles', {
          roleName: this.addRoleForm.addRoleName,
          roleDesc: this.addRoleForm.roleDesc
        })
        // console.log(res)
        if (!res.meta.status === 201) {
          this.$message.error(res.meta.msg)
        }
        this.getRoleList()
        this.addRoleDialogVisible = false
      })
    },
    // 编辑角色的dialog框关闭事件
    editRoleDialogClosed () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 编辑角色dialog框提交事件
    editRole () {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `roles/${this.roleForm.roleId}`,
          this.roleForm
        )
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success('提交成功')
        }
        this.editRoleDialogVisible = false
        this.getRoleList()
      })
    },
    // 编辑角色按钮点击事件
    async showEditDialog (roleId) {
      this.editRoleDialogVisible = true
      // console.log('id:' + roleId)
      const { data: res } = await this.$http.get(`roles/${roleId}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.roleForm = res.data
    },
    // 删除角色按钮点击事件
    showDeleteDialog (row) {
      this.deleteRoleDialogVisible = true
      this.roleForm.roleId = row.id
      this.roleForm.roleName = row.roleName
    },
    // 删除角色dialog框提交事件
    async deleteRole () {
      const { data: res } = await this.$http.delete(
        `roles/${this.roleForm.roleId}`
      )
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
      } else {
        this.$message.success(res.meta.msg)
      }
      this.deleteRoleDialogVisible = false
      this.getRoleList()
    },
    // 移除角色权限
    async removeRightById (role, rightId) {
      const removeRightResult = await this.$confirm(
        '是否确认删除该权限?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // console.log(removeRightResult)

      if (removeRightResult === 'confirm') {
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
        }
        role.children = res.data
      } else {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
    },
    // 分配权限按钮点击事件
    async showSetRight (role) {
      this.roleId = role.id
      this.defChecked = []
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rightsList = res.data
      this.getLeafId(role, this.defChecked)
      // console.log(this.defChecked)
      this.setRightDialogVisible = true
      // console.log(this.roleList)
    },
    // 递归获取所有三级权限的id
    getLeafId (node, arr) {
      // 如果没有children属性，则为三级权限，获取push id后返回
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果有children属性，递归该children
      node.children.forEach(item => {
        this.getLeafId(item, arr)
      })
    },
    // 分配权限提交事件
    async setRight () {
      const checkId = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(checkId)
      const strCheckId = checkId.join(',')
      // console.log(strCheckId)
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: strCheckId })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // console.log(res)
      this.getRoleList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less">
.deleteRoleColor {
  color: rgb(247, 97, 97);
}
.auth_common {
  margin: 7px;
}
.col_top {
  border-top: 1px solid #eee;
}
.col_bottom {
  border-bottom: 1px solid #eee;
}
.flex_align_center {
  display: flex;
  align-items: center;
}
</style>
