
<template>
<div class="tab-pane fade" id="urls" role="tabpanel" aria-labelledby="urls-tab">
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
        <div class="form-group">
              <button type="button" data-toggle="modal" data-target="#urlEditDialog" class="btn btn-primary btn-lg btn-block" @click="setSelectedUrl('','')">Add New</button>
             
            
            <table class="table table-hover table-responsive">
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
</template>
<script>
import axios from "axios";
import moment from "moment";
import _ from "lodash";
export default {
  name: "urlManager",
  components: {
    axios,
    moment
  },
  data: function() {
    return {
      fetching: "false",
      urls: [],
      newUrls: {
        urlName: "",
        url: ""
      },
      selectedUrl: {
        urlName: "",
        url: ""
      },
      urlPersistStatus: "",
      statusListEndPoint: "http://localhost:7071/api/statusSiteStateReader",
      statusRemoverEndPoint:
        "https://functions-cpsc1.azurewebsites.net/api/status",
      urlListEndPoint: "https://functions-cpsc1.azurewebsites.net/api/urls",
      urlManagementEndPoint:
        "https://functions-cpsc1.azurewebsites.net/api/url"
    };
  },

  mounted: function() {
    this.getUrls();
  },
  methods: {
    onAddUrlBtnClicked() {
      this.urls = [];
      this.addUrls();
      this.getUrls();
    },
    setSelectedUrl(urlName, url) {
      let vm = this;

      vm.selectedUrl.urlName = urlName;
      vm.selectedUrl.url = url;
      console.log(this.selectedUrl);
    },
    saveUrlChanges() {
      let vm = this;
      axios.defaults.withCredentials = false;
      axios
        .put(vm.urlManagementEndPoint, [
          {
            urlName: vm.selectedUrl.urlName,
            url: vm.selectedUrl.url
          }
        ])
        .catch(function(error) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            vm.urlPersistStatus = "Error processing";
            vm.response.data = JSON.stringify(error.response);
            vm.response.status = error.response.status;
          }
          vm.fetching = false;
        })
        .then(function(response) {
          if (response) {
            console.log(response);
            vm.urlPersistStatus = "saved successfully";
          }
          vm.fetching = false;
        });
    },
    addUrls() {
      var vm = this;

      console.log(vm.newUrls);
      axios
        .post(vm.urlManagementEndPoint, [
          {
            urlName: vm.newUrls.urlName,
            url: vm.newUrls.url
          }
        ])
        .catch(function(error) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            vm.urlPersistStatus = "Error saving url";
            vm.response.data = JSON.stringify(error.response);
            vm.response.status = error.response.status;
            console.log(vm.response);
          }
          vm.fetching = false;
        })
        .then(function(response) {
          if (response) {
            console.log(response);
            vm.urlPersistStatus = "saved successfully";
          }
          vm.fetching = false;
        });
    },
    getUrls() {
      var vm = this;

      axios
        .get(vm.urlListEndPoint, {
          withCredentials: false
        })
        .catch(function(error) {
          vm.response.data = JSON.stringify(response);
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            vm.urlPersistStatus = "Error retrieving data";
            vm.response.data = JSON.stringify(error.response);
            vm.response.status = error.response.status;
            console.log(vm.response);
          }
          vm.fetching = false;
        })
        .then(function(response) {
          if (response) {
            console.log(response);
            response.data.forEach(i => {
              vm.urls.push(i);
            });
          }
          vm.fetching = false;
        });
    }
  }
};
</script>
