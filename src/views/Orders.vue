<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 搜索区 -->
      <el-row>
        <el-col :span="10">
          <el-input placeholder="接口未提供该功能" v-model="queryInfo.query">
            <el-button @click="getOrdersList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区 -->
      <el-table :data="ordersList" stripe border="" style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <template v-slot:default="data">
            <el-tag v-if="data.row.order_pay">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template v-slot:default="data">{{data.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="data">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditAddrDialog()"></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressDialog(data.row.order_id)"
            ></el-button>
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
      <!-- 修改地址dialog框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="editAddrDialogVisible"
        width="50%"
        @closed="editAddrDialogClosed"
      >
        <!-- 表单区 -->
        <el-form :model="editAddrForm" :rules="rules" ref="editAddrFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader :options="cityData" v-model="editAddrForm.address1" class="editAddrInput"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="editAddrForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <!-- 取消&确定 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editAddrDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editAddr">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 物流dialog框 -->
      <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="30%">
        <!-- 展示区 -->
        <el-timeline :reverse="false">
          <el-timeline-item
            v-for="(activity, index) in progressDate"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
        <!-- 取消&确定 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="progressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from '../assets/citydata.js'

export default {
  data () {
    return {
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
        user_id: '',
        pay_status: '',
        is_send: '',
        order_fapiao_title: '',
        order_fapiao_company: '',
        order_fapiao_content: '',
        consignee_addr: ''
      },
      // 订单列表数据
      ordersList: [],
      // 订单总数
      total: 0,
      // 控制修改地址dialog框显隐
      editAddrDialogVisible: false,
      // 修改地址表单数据
      editAddrForm: {
        address1: [],
        address2: ''
      },
      // 省市区/县数据
      cityData,
      // 表单验证规则
      rules: {
        address1: [{ required: true, message: '请选择地区', trigger: 'blur' }],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 物流dialog框显隐
      progressDialogVisible: false,
      // 物流进度数据
      progressDate: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ],
      // 当前用户id
      curId: ''
    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    // 获取订单列表
    async getOrdersList () {
      await this.$http
        .get('orders', { params: this.queryInfo })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          this.ordersList = res.data.data.goods
          this.total = res.data.data.total
        })
        .catch(err => err)
    },
    // 每页显示数改变事件
    handleSizeChange (size) {
      this.queryInfo.pagesize = size
      this.getOrdersList()
    },
    // 当前页改变事件
    handleCurrentChange (page) {
      this.queryInfo.pagenum = page
      this.getOrdersList()
    },
    // 展示修改地址dialog框
    showEditAddrDialog () {
      this.editAddrDialogVisible = true
    },
    // 关闭-修改地址dialog框事件
    editAddrDialogClosed () {
      this.$refs.editAddrFormRef.resetFields()
    },
    // 修改地址提交事件
    editAddr () {
      this.$refs.editAddrFormRef.validate(valid => {
        if (!valid) {
          return
        }
        this.$message.success('接口未提供该功能')
        this.editAddrDialogVisible = false
      })
    },
    // 展示物流进度dialog框
    // 接口错误..........
    async showProgressDialog (id) {
      this.progressDialogVisible = true
      /* console.log(id)
      await this.$http.get(`kuaidi/${id}`)
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          console.log(res.data.data)
          this.progressDate = res.data.data
        })
        .catch(err => console.log(err)) */
    }
  }
}
</script>

<style lang="less" scoped>
.editAddrInput {
  width: 70%;
}
</style>
