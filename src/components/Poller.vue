<template>
  <div>
    <ul class="nav nav-tabs" id="statusTab" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" id="cardDisplay-tab" data-toggle="tab" role="tab" aria-controls="cardDisplay"
          href="#cardDisplay" aria-selected="false">Statuses</a>
      </li>
       <li class="nav-item">
        <a class="nav-link" id="urls-tab" data-toggle="tab" href="#urls" role="tab" aria-controls="urls"
          aria-selected="false">Url Management</a>
      </li>

      <!--<li class="nav-item">
          <a class="nav-link" id="statusHistory-tab" data-toggle="tab" href="#statusHistory" role="tab" aria-controls="statusHistory" aria-selected="false">Status History</a>
        </li>-->

    </ul>
    <div class="tab-content" id="statustabContent">
      <div class="tab-pane fade show active" id="cardDisplay" role="tabpanel" aria-labelledby="cardDisplay-tab">
        <div class="form-control">
          <button @click="onRefreshBtnClicked()" type="button" class="btn btn-primary btn-lg btn-block">Refresh
          </button>

        </div>
        <div v-if="!fetching || !showStatusPanel">
          <h3>Last Updated: <span class="label label-default">{{lastUpdated}}</span></h3>
          <h3 v-if="!generalFailureIndicator"><i class="fas fa-check-circle" style="color:green;"></i></h3>
          <h3 v-if="generalFailureIndicator"><i class="fas fa-exclamation-circle" style="color:red;"></i></h3>
        </div>
        <hr>

      <div v-show="fetching" class="progress">
        <div class="progress-bar progress-bar-striped bg-danger progress-bar-animated" role="progressbar"
          aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%"></div>
      </div>

      <div class="container">
        <table v-if="!fetching || !showStatusPanel" id="urlList" class="display responsive no-wrap" width="100%">
          <thead>
            <tr>
              <th scope="col">Url Status</th>
              <th scope="col">Url</th>
              <th scope="col">Status Description</th>
              <th scope="col">Status Code</th>

            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
      </div>
      <!--Table View>-->
      <div v-if="fetching" class="well well-lg"></div>

      <url-manager></url-manager>
    </div>
  </div>
</template>

<script>
  import axios from "axios";
  import moment from "moment";
  import _ from "lodash";
  import urlManager from "./UrlManager.vue"

  export default {
    name: "poller",
    components: {
      axios,
      moment,
      urlManager
    },
    data: function () {
      return {
        response: {
          data: "",
          status: "",
          statusText: ""
        },
        fetching: "false",
        statuses: [],
        selectedStatus: {
          urlName: "",
          url: ""
        },
        lastUpdated: null,
        tableView: true,
        datatable: null,
        showStatusPanel: false,
        statusLabel: "",
        successStatusIndicator:0,
        generalFailureIndicator:false

      };
    },



    mounted: function () {
      let vm = this
      vm.getStatuses();
    },
    methods: {
      isAtLeastOneFailure(statuses){
       return (statuses.length == 0?false:statuses.filter(x=>x.statusCode==0).length)>0
     },
      onRefreshBtnClicked() {
        this.fetching = true;
        this.statuses = [];
        this.refreshPollStatuses();
      },
      hydrateDataTable(statuses) {
        let vm = this
        let statusIndicator;

        statuses.forEach(status => {
          statusIndicator = status.statusCode.toString() ===  vm.successStatusIndicator.toString() ?
            '<td  class="card-text"><i class="fas fa-check-circle" style="color:green;"></i></td>' :
            '<td  class="card-text"><i class="fas fa-exclamation-circle" style="color:red;"></i></td>'
          vm.datatable.row.add([
            status.urlName + ' ' + statusIndicator ,
            '<a href="'+ status.url + '">' + status.url + '</a>',
            status.description,
            status.statusCode,
            status.urlName,

          ]).draw(false)
        })
      },
      getStatuses() {
        var vm = this;
        vm.datatable = $('#urlList').DataTable({
          "retrieve": true,
          "responsive": true,
          "order": [
            [3, "desc"]
          ],
          "dom": "Bfrtip",
          "buttons": [
            "csv", "excel"
          ]

        });



        vm.statuses = [];
        const statusListEndPoint = process.env.STATUS_LIST_ENDPOINT
        axios
          .get(statusListEndPoint, {
            withCredentials: false
          })
          .catch(function (error) {

            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              vm.response.data = JSON.stringify(error.response);
              vm.response.status = error.response.status;
            }
            vm.fetching = false;
          })
          .then(function (response) {

            if (response) {
              var status = {};
              let data = response.data.forEach(i => {
                status = {
                  rowKey: i.RowKey,
                  urlName: i.UrlName,
                  url: i.Url,
                  description: i.Description,
                  status: i.Status,
                  date: new moment(i.Date).format("MMMM Do YYYY, h:mm:ss a"),
                  statusCode: i.Status==='OK'?vm.successStatusIndicator:1
                };

                let found = vm.statuses.find(element => {
                  return element.urlName === status.urlName;
                });
                vm.statuses.push(status);
                vm.generalFailureIndicator=vm.isAtLeastOneFailure(vm.statuses)
              });
              vm.hydrateDataTable(vm.statuses)
              vm.lastUpdated = vm.statuses.length > 0 ? vm.statuses[0].date : "All URLS are OK"
            }
            vm.statuses.sort(function (a, b) {
              let statusA = a.status;
              let statusB = b.status;
              if (statusA < statusB) {
                return -1;
              }
              if (statusA > statusB) {
                return 1;
              }

              return 0;
            });
            vm.fetching = false;
          });
      },
      refreshPollStatuses() {
        var vm = this;
        this.statusRefreshRequested = true
        const statusRefreshEndPoint = process.env.STATUS_REFRESH_ENDPOINT
        axios
          .get(statusRefreshEndPoint, {
            withCredentials: false
          })
          .catch(function (error) {

            if (error.response) {
              vm.response.data = JSON.stringify(error.response)
              vm.response.status = error.response.status
            }
            vm.fetching = false;
          })
          .then(function (response) {
            if (response) {
              vm.response.status = response.status;
              if (response.status) {
                vm.lastUpdated = response.data
                vm.toggleStatusPanel()

              }
            }
            vm.fetching = false

          });
      },
      toggleStatusPanel() {
        let vm = this;
        vm.showStatusPanel = true

      }
    }
  };

</script>
