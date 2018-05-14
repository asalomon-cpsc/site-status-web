<template>
<div >
    <div class="modal fade" id="urlEditDialog" tabindex="-1" role="dialog" aria-labelledby="urlEditDialogTitle" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="urlEditDialogTitle">Url Management</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <template v-if="selectedUrl.urlName!==''" >
            <div class="modal-body">
              <p >To Delete the {{selectedUrl.urlName}} url, remove it from the url text field and save your changes</p>
              <div class="input-group input-group-sm mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="inputGroup-sizing-sm">Url Name</span>
                </div>
                <input type="text" :readonly="selectedUrl.urlName!==''" class="form-control" aria-label="Url Name" v-model="selectedUrl.urlName"
                  aria-describedby="inputGroup-sizing-sm">
              </div>
    
              <div class="input-group input-group-sm mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="inputGroup-sizing-sm">Url</span>
                </div>
                <input type="textarea" class="form-control" aria-label="Url" v-model="selectedUrl.url" aria-describedby="inputGroup-sizing-sm">
              </div>
            </div>
            <div class="modal-footer">
              <p class="alert-info">{{urlPersistStatus}}</p>
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" @click="saveUrlChanges()">Save </button>
    
            </div>
            </template>
            <template v-if="selectedUrl.urlName==''">
            <div  class="modal-body">
               
                <div class="input-group input-group-sm mb-3">
                  <div class="input-group-prepend">
                    <span class="input-group-text" id="inputGroup-sizing-sm">Url Name</span>
                  </div>
                  <input type="text"  class="form-control" aria-label="Url Name" v-model="newUrls.urlName"
                    aria-describedby="inputGroup-sizing-sm">
                </div>
    
                <div class="input-group input-group-sm mb-3">
                  <div class="input-group-prepend">
                    <span class="input-group-text" id="inputGroup-sizing-sm">Url</span>
                  </div>
                  <input type="textarea" class="form-control" aria-label="Url" v-model="newUrls.url" aria-describedby="inputGroup-sizing-sm">
                </div>
              </div>
              <div class="modal-footer">
                <p class="alert-info">{{urlPersistStatus}}</p>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" @click="onAddUrlBtnClicked()">Save </button>
    
              </div>
            </template>
          </div>
        </div>
      </div>
    
    
      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item "  >
          <a class="nav-link active" id="cardDisplay-tab" data-toggle="tab" role="tab" aria-controls="cardDisplay" href="#cardDisplay" aria-selected="false" >Statuses</a>
         
        
        </li>
        <li class="nav-item">
          <a class="nav-link" id="urls-tab" data-toggle="tab" href="#urls" role="tab" aria-controls="urls" aria-selected="false">Url Management</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="charts-tab" data-toggle="tab" href="#charts" role="tab" aria-controls="charts" aria-selected="false">Dashboard</a>
        </li>
    
      </ul>
      <div class="tab-content" id="myTabContent">
    
    
        <div class="tab-pane fade show active" id="cardDisplay" role="tabpanel" aria-labelledby="cardDisplay-tab">
            <div class="form-control">
                <button @click="onRefreshBtnClicked()" type="button" class="btn btn-primary btn-lg btn-block">Refresh </button>
    
              </div>
              <div v-show="fetching" class="progress">
                <div class="progress-bar progress-bar-striped bg-danger progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0"
                  aria-valuemax="100" style="width: 75%"></div>
              </div>
              
            <div v-show="!fetching" class="card-columns">
                <div v-for="status in statuses" class="card bg-transparent border-success mb-3"
                v-bind:class="{ 'card bg-transparent border-success mb-3':status.status==='OK', 'card border-danger mb-3': status.status!=='OK' }">
                <div class="card-header">{{status.urlName}}
    
                </div>
                  <div class="card-body">
                    <p class="card-text">{{status.url}}</p>
                    <h3 v-if="status.status==='OK'" class="card-text">
                        <i class="fas fa-check-circle" style="color:green;"></i>
                    </h3>
                    <h3 v-else class="card-text">
                        <i class="fas fa-exclamation-circle" style="color:red;"></i>
                        
                    </h3>
                    <p class="card-text"><small class="text-muted">Last updated: {{status.date}}</small></p>
                  </div>
                  <div v-if="status.status!=='OK'" class="card-footer">
                     Http Error: {{status.description}}
                  </div>
                </div>
            </div>
        </div>
    
    
        <div class="tab-pane fade" id="urls" role="tabpanel" aria-labelledby="urls-tab">
          <hr/>
          <div class="form-group">
              <button type="button" data-toggle="modal" data-target="#urlEditDialog" class="btn btn-primary btn-lg btn-block" @click="setSelectedUrl('','')">Add New</button>
             
            
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">UrlName</th>
                  <th scope="col">Url</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="url in urls">
                  <th scope="row">{{url.UrlName}}</th>
                  <td>{{url.Url}}</td>
                  <td>
                    <button data-toggle="modal" data-target="#urlEditDialog" @click="setSelectedUrl(url.UrlName,url.Url)">Edit</button>
                  </td>
                </tr>
    
              </tbody>
            </table>
          </div>
        </div>
    
    
    <!--<div class="tab-pane fade" id="charts" role="tabpanel" aria-labelledby="charts-tab">
        
         <line-chart></line-chart>
    </div>
      <line-chart></line-chart>-->
      </div>
      </div>
      </template>

      <script>
     import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
  export default {
  name: 'poller',
  components: {
   axios,
   moment,
   
  },
  data:function() {
    return{
    response: {
      data: '',
      status: '',
      statusText: ''
    
    },
    fetching: "false",
    statuses: [],
    urls: [],
    newUrls:{
      urlName:'',
      url:''
    },
    selectedUrl:{
      urlName:'',
      url:''
    },
    selectedStatus:{
      urlName:'',
      url:''
    },
    urlPersistStatus:'',
    statusListEndPoint:"http://localhost:7071/api/statusSiteStateReader",
    statusRemoverEndPoint:"https://functions-cpsc1.azurewebsites.net/api/status",
    urlListEndPoint:"http://localhost:7071/api/statusUrlListReader",
    urlManagementEndPoint:"htt[://localhost:7071/api/urlPersister",
    statusRefreshEndPoint:"http://localhost:7071/api/statusPoller_http",
  }
  },
  

  mounted: function () {
    
    this.getStatuses()
    this.getUrls()

  },
  methods: {
    onRefreshBtnClicked() {
      this.fetching = true
      this.statuses = []
      this.refreshPollStatuses()
      this.getStatuses()

    },
    onAddUrlBtnClicked(){
      this.urls=[]
      this.addUrls()
      this.getUrls()
    
    },
    setSelectedUrl(urlName, url){
      let vm = this
     
     vm.selectedUrl.urlName = urlName
     vm.selectedUrl.url = url
     console.log(this.selectedUrl)
    },
    saveUrlChanges(){
      let vm = this
      axios.defaults.withCredentials = false
      axios.put(vm.urlManagementEndPoint, 
        [{
          urlName:vm.selectedUrl.urlName,
          url:vm.selectedUrl.url
        }]
      ).catch(function (error) {
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          vm.urlPersistStatus = "Error processing"
          vm.response.data = JSON.stringify(error.response);
          vm.response.status = error.response.status;
        }
        vm.fetching = false
      })
        .then(function (response) {
          if (response) {
            console.log(response)
            vm.urlPersistStatus = "saved successfully"
          }
          vm.fetching = false
        });

    },
    addUrls(){
      var vm = this;
      
      console.log(vm.newUrls)
      axios.post(vm.urlManagementEndPoint, 
        [{
          urlName:vm.newUrls.urlName,
          url:vm.newUrls.url
        }]
      ).catch(function (error) {
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          vm.urlPersistStatus = "Error saving url"
          vm.response.data = JSON.stringify(error.response);
          vm.response.status = error.response.status;
          console.log(vm.response)

        }
        vm.fetching = false
      })
        .then(function (response) {
          if (response) {
            console.log(response)
            vm.urlPersistStatus = "saved successfully"
          }
          vm.fetching = false
        });
    },
    getUrls() {

      var vm = this;
      
      axios.get(vm.urlListEndPoint, {
        withCredentials: false
      }).catch(function (error) {
        vm.response.data = JSON.stringify(response);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          vm.urlPersistStatus = "Error retrieving data"
          vm.response.data = JSON.stringify(error.response);
          vm.response.status = error.response.status;
          console.log(vm.response)

        }
        vm.fetching = false
      })
        .then(function (response) {
          if (response) {
            console.log(response)
            response.data.forEach(i=>{
              vm.urls.push(i)
            })
          }
          vm.fetching = false
        });
    },
    deleteStatus(){
      let vm = this
      let params =  {
        urlName :vm.selectedStatus.urlName,
        url: vm.selectedStatus.url
      }
      axios.delete(vm.statusRemoverEndPoint,params
      ).catch(function (error) {
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          vm.urlPersistStatus = "Error processing"
          console.log(error.response)
          vm.response.data = JSON.stringify(error.response);
          vm.response.status = error.response.status;
        }
        vm.fetching = false
      })
        .then(function (response) {
          console.log(response)
          if (response) {
            console.log(response)
            vm.urlPersistStatus = "deleted successfully"
          }
          vm.fetching = false
        });
    },
    getStatuses() {
      
      var vm = this;
      vm.statuses=[]
      axios.get(vm.statusListEndPoint, {
        withCredentials: false
      }).catch(function (error) {
        vm.response.data = JSON.stringify(response);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          vm.response.data = JSON.stringify(error.response);
          vm.response.status = error.response.status;
        }
        vm.fetching = false
      })
        .then(function (response) {
          //console.log(response)
          if (response) {
            var status={}
            let data= response.data.forEach((i)=>{
              status={
                rowKey: i.RowKey,
                urlName:i.UrlName,
                url:i.Url,
                description:i.Description,
                status:i.Status,
                date:new moment(i.Date).format('MMMM Do YYYY, h:mm:ss a')
              }
              console.log('does url ' +status.urlName+ 'exist ',vm.statuses.includes(status))
              let found = vm.statuses.find((element)=>{
                return element.urlName === status.urlName
              })
              console.log(found)
              vm.statuses.push(status)
              if(found==null|| found==undefined){
              
              console.log('not found')
              
              }else if (found){
               
                console.log('found')
              
              }
            }) 
          }
          vm.statuses.sort(function(a,b){
            let nameA = a.status
            let nameB = b.status
            if(nameA < nameB){
              return -1
            }
            if(nameA > nameB){
              return 1
            }

            return 0;
          })
          vm.fetching = false
        });
    },
    refreshPollStatuses() {
      
      var vm = this;
      axios.get(vm.statusRefreshEndPoint, {
        withCredentials: false
      }).catch(function (error) {
        vm.response.data = JSON.stringify(response);
        if (error.response) {
          vm.response.data = JSON.stringify(error.response);
          vm.response.status = error.response.status;
        }
        vm.fetching = false
      })
        .then(function (response) {
          console.log(response)
          if (response) {
           //
          }
          vm.fetching = false
        });
    }
  }

}

    </script>