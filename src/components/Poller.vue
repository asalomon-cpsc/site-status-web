<template>
  <div>
    <ul class="nav nav-tabs" id="myTab" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" id="cardDisplay-tab" data-toggle="tab" role="tab" aria-controls="cardDisplay"
          href="#cardDisplay" aria-selected="false">Statuses</a>
      </li>
     <!-- <li class="nav-item">
        <a class="nav-link" id="urls-tab" data-toggle="tab" href="#urls" role="tab" aria-controls="urls"
          aria-selected="false">Url Management</a>
      </li>-->

      <!--<li class="nav-item">
          <a class="nav-link" id="statusHistory-tab" data-toggle="tab" href="#statusHistory" role="tab" aria-controls="statusHistory" aria-selected="false">Status History</a>
        </li>-->

    </ul>
    <div class="tab-content" id="myTabContent">
      <div class="tab-pane fade show active" id="cardDisplay" role="tabpanel" aria-labelledby="cardDisplay-tab">
        <div class="form-control">
          <button @click="onRefreshBtnClicked()" type="button" class="btn btn-primary btn-lg btn-block">Refresh
          </button>

        </div>
        <div  v-if="!fetching || !showStatusPanel">
          <h3>Last Updated: <span class="label label-default">{{lastUpdated}}</span></h3>
        </div>
        <hr>
      </div>
      <div v-show="fetching" class="progress">
        <div class="progress-bar progress-bar-striped bg-danger progress-bar-animated" role="progressbar"
          aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%"></div>
      </div>

      <div class="container">
        <table v-if="!fetching || !showStatusPanel" id="urlList" class="display">
          <thead>
            <tr>
              <th scope="col">Status</th>
              <th scope="col">Url</th>
              <th scope="col">Status Description</th>
              <th scope="col">Name</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
      <!--Table View>-->
      <div v-if="fetching" class="well well-lg">Status refresh Submitted Successfully....Refresh the page (F5) in a few
        secondes for new data</div>

    </div>
     <!--
    <div class="tab-pane fade" id="urls" role="tabpanel" aria-labelledby="urls-tab">
      <hr />
      <url-manager></url-manager>
    </div>-->
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
        lastUpdated:null,
        tableView: true,
        datatable: null,
        showStatusPanel: false

      };
    },
   

    mounted: function () {
      let vm = this
      vm.getStatuses();
    },
    methods: {
      onRefreshBtnClicked() {
        this.fetching = true;
        this.statuses = [];
        this.refreshPollStatuses();
      },
      hydrateDataTable(statuses) {
        let vm = this
        let statusIndicator;
        statuses.forEach(status => {
          statusIndicator = status.status === 'OK' ?
            '<td  class="card-text"><i class="fas fa-check-circle" style="color:green;"></i></td>' :
            '<td  class="card-text"><i class="fas fa-exclamation-circle" style="color:red;"></i></td>'
            vm.datatable.row.add([
            statusIndicator,
            '<a href="#">' + status.url + '</a>',
            status.description,
            status.urlName
          ]).draw(false)
        })
      },
      getStatuses() {
        var vm = this;
        vm.datatable = $('#urlList').DataTable({
          "retrieve": true,
          "order": [
            [1, "desc"]
          ],
          "dom": "Bfrtip",
          "buttons": [
            "csv", "excel", "pdf"
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
              console.log(response.data.length)
              let data = response.data.forEach(i => {
                status = {
                  rowKey: i.RowKey,
                  urlName: i.UrlName,
                  url: i.Url,
                  description: i.Description,
                  status: i.Status,
                  date: new moment(i.Date).format("MMMM Do YYYY, h:mm:ss a")
                };

                let found = vm.statuses.find(element => {
                  return element.urlName === status.urlName;
                });
                vm.statuses.push(status);
              });
              vm.hydrateDataTable(vm.statuses)
              vm.lastUpdated = vm.statuses.length >0 ? vm.statuses[0].date: "No Status To Report"
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
