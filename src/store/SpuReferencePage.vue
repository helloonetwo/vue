<template>
<simple-page :hasViewPermission="hasViewPermission" :add-visible="false" class="spu_reference" @refresh="onRefresh" @add="onAdd" @search="onSearch" search-placeholder="" add-text="新增" :tools-visible="true" :search-visible="false" :search-more-visible="false" :refresh-visible="true">
  <!-- :add-visible="hasAddPermission" -->
  <!-- <el-upload slot="button-more"
    class="upload"
    v-if="hasImportPermission"
    name="spuReferenceExcel"
    accept=".xlsx,.xls,.csv"
    :multiple="false"
    :show-file-list="false"
    :action="importUrl + '&p=' + this.current_row.kid"
    :on-success="handleExcelSuccess"
    :on-error="handleFileError"
  >
    <el-button icon="el-icon-upload"   type="info">导入</el-button>
  </el-upload> -->
  <el-row slot="content" type="flex" :gutter="20">
    <el-col :span="5">
      <el-table @row-click="rowClick"
                :row-class-name="tableRowClassName"
                :row-style="selectedHighlight"
                ref="spuProfileTable"
                :data="spu_profiles"
                 @current-change="onTableRowChange"
                 row-key="kid"
                 style="width: 100%">
        <el-table-column label="属性类别" prop="spu_attribute_desc" header-align="center" align="center">
        </el-table-column>
        <el-table-column label="" width="130" header-align="center" align="center" v-if="true">
          <template scope="scope">
                  <el-button
                    style="float:left"
                    v-if="hasAddPermission"
                    type="primary" size="mini" icon="el-icon-plus"
                    @click="onAdd(scope.row.kid)">
                  </el-button>
                  <el-upload slot="button-more"
                    class="upload"
                    v-if="hasImportPermission"
                    name="spuReferenceExcel"
                    accept=".xlsx,.xls,.csv"
                    :multiple="false"
                    :show-file-list="false"
                    :action="importUrl + '&p=' + this.spu_profile_kid"
                    :on-success="handleExcelSuccess"
                    :on-error="handleFileError"
                  >
                    <el-button icon="el-icon-upload"  type="primary"></el-button>
                  </el-upload>
         </template>
        </el-table-column>

      </el-table>
    </el-col>
    <el-col :span="19">
      <el-tree v-show="current_row" v-loading="uistate.loading" :props="eltreeProps" :data="spu_references" :render-content="renderContent" node-key="spu_reference_code" default-expand-all check-strictly min-height="500px">
      </el-tree>
      <div style="top: 50%;left: 40%;position: absolute;">
        <span v-show="!current_row" style="color: #B4BCCC; font-size: 12px;"><i class="el-icon-back"></i> 请先选择左边角色</span>
      </div>
    </el-col>
  </el-row>
</simple-page>
</template>

<script>
import api from '@/api'
import SimplePage from '@/components/template/SimplePage'
import ParentPage from '@/components/template/ParentPage'
import * as rests from '@/constant/rest_consts.js'
import * as spus from '@/constant/spu_consts.js'
import spu_reference from '@/store/modules/master/spu_reference'
import spu_profile from '@/store/modules/master/spu_profile'
import {
  mapGetters,
  mapActions
} from 'vuex'

export default {
  name: 'spu_reference',
  permission: 'spu_reference',
  extends: ParentPage,
  components: {
    SimplePage
  },
  data() {
    return {
      current_row: {},
      spu_profiles: [],
      spu_references: [],
      search_text: '',
      eltreeProps: {
        children: 'spu_references'
      },
      uistate: {
        initing: true,
        loading: true,
        result: {}
      }
    }
  },
  computed: {
    ...mapGetters([
      'accessToken'
    ]),
    importUrl () {
      return api.$master.root + '/spu_reference/import?AccessToken=' + this.accessToken
    }
  },
  created: function() {
    if (!this.$store.state.spu_profile) {
      this.$store.registerModule('spu_profile', spu_profile);
    }
    if (!this.$store.state.spu_reference) {
      this.$store.registerModule('spu_reference', spu_reference);
    }

    let vm = this;
    let payload = {
      params: {
        is_options: 1
      },
      callback: {
        success: (result) => {
          vm.uistate.result = {
            resultcode: rests.SUCCEED
          };
          vm.spu_profiles = result;
          setTimeout(function() {
            vm.$refs.spuProfileTable.setCurrentRow(vm.spu_profiles[0]);
            vm.uistate.loading = false;
          }, 500);
        },
        failed: (resultcode, message, detail) => {
          vm.uistate.result = {
            resultcode: resultcode,
            message: message,
            detail: detail
          };
          vm.uistate.loading = false;
        },
        completed: () => {}
      }
    }
    this.listSpuProfile(payload);
  },
  beforeMount() {
    this.uistate.loading = false;
  },
  methods: {
    ...mapActions('spu_profile', [
      'listSpuProfile'
    ]),
    ...mapActions('spu_reference', [
      'listSpuReference',
      'deleteSpuReference'
    ]),
    onRefresh() {
      this.$emit('refresh');
    },
    onAdd(kid, parent_kid) {
      this.$router.push({
        path: '/master/spu_reference_add.html',
        query: {
          spu_profile_kid: kid,
          parent_kid: parent_kid||spus.ROOT
        }
      });
    },
    onSearch(search_text) {
      this.search_text = search_text;
    },
    onEdit(spu_reference_kid) {
      this.$router.push({
        path: '/master/spu_reference_edit.html',
        query: {
          kid: spu_reference_kid
        }
      });
    },
    onTableRowChange(val) {
      this.current_row = val;
      if(!this.current_row){
        return;
      }

      let vm = this;
      this.uistate.loading = true;
      this.uistate.initing = true;
      let payload = {
        params: {
          spu_profile_kid: vm.current_row.kid
        },
        callback: {
          success: (result) => {
            vm.spu_references = result;
          },
          failed: (resultcode, message, detail) => {
            vm.$message.error('获取' + vm.current_row.spu_attribute_desc + '失败：' + message);
            console.log('login error: ' + resultcode + ' - ' + message + ' ' + (detail || ''));
          },
          completed: () => {
            vm.uistate.loading = false;
            vm.uistate.initing = false;
          }
        }
      }
      this.listSpuReference(payload);
    },
    onDelete(index, row) {
      let vm = this;
      this.$prompt('确认删除"' + row.spu_reference_value + '"吗? 确认请输出 DELETE', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /DELETE/,
        inputErrorMessage: '请输入DELETE确认删除'
      }).then(({
        value
      }) => {
        vm.uistate.loading = true;
        let payload = {
          params: {
            kid: row.kid
          },
          callback: {
            success: (result) => {
              vm.$message({
                message: '保存成功',
                type: 'success'
              });
              vm.$router.go(0);
            },
            failed: (resultcode, message, detail) => {
              vm.$message.error(message);
              console.log('login error: ' + resultcode + ' - ' + message + ' ' + (detail || ''));
            },
            completed: () => {
              vm.uistate.loading = false;
            }
          }
        }
        vm.deleteSpuReference(payload);
      }).catch(() => {});
    },
    onSearchMore() {},
    renderContent(h, { node, data, store }) {
      return (<div style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;">
          <span>
            <span style="color: #99A9BF; position: static; left: 10px;"> {data.spu_reference_code} - {data.spu_reference_value}</span>
            <span style="color: #99A9BF; position: static; left: 50px;"> {data.choosable == 1 ? '[可选]' : ''}</span>
          </span>

          <span>
            {(this.hasAddPermission) && this.current_row.reference_values_type == spus.REFERENCE_VALUES_TYPE__TREE ? <el-button size="mini" on-click={ () => this.onAdd(this.current_row.kid, data.kid) }><i class="el-icon-plus"></i></el-button> : ''}
            {this.hasEditPermission ? <el-button size="mini" on-click={ () => this.onEdit(data.kid) }><i class="el-icon-edit"></i></el-button> : ''}
            {this.hasDeletePermission ? <el-button size="mini" type="danger" on-click={ () => this.onDelete(store, data) }><i class="el-icon-delete"></i></el-button> : ''}
          </span>
        </div>);
    },
    handleExcelSuccess (response, file, fileList) {
      if (response.resultcode == 1){
        this.$message({
          message: '成功导入' + response.data + '笔数据',
          type: 'success'
        });
      } else {
        this.$message.warning(response);
      }
    },
    handleFileError (msg, file, fileList) {
      console.info(msg, files, fileList);
      this.$message.warning(msg);
    },
    tableRowClassName ({row, rowIndex}) {
     row.index = rowIndex;
    },
    selectedHighlight({row, rowIndex}) {

         if ((this.getIndex) === rowIndex ) {
            return {
          "background-color": "#CAE1FF"
       };
     }
    },
    rowClick (row) {
        this.getIndex=row.index
    }
  }
}
</script>

<style>
.el-table .warning-row {
   background: oldlace;
 }

 .el-table .success-row {
   background: #f0f9eb;
 }
.spu_reference .content {
  border: 1px solid #eaeefb;
  background-color: #FFFFFF
}
.el-tree-node__content {
  padding-top: 10px;
  padding-bottom: 10px;
}
.upload {
   height:28px;
}
</style>
