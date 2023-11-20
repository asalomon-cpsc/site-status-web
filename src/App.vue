<template>
  <div id="app"  class="container">
    <div class=".d-sm-none .d-md-block">
      
    <h3 class="display-5">{{title}}</h3>
  <p class="lead">{{description}}</p>
  <hr class="my-5">
  <h3>Technologies</h3>
 
  <div class="list-group">
  <a  v-for="t in technologies" :href="t.docUrl" class="list-group-item list-group-item-action flex-column align-items-start">
    <div class="d-flex w-100 justify-content-between">
      <h5 class="mb-1">{{t.name}}</h5>
      
    </div>
    <p class="mb-1">{{t.description}}.</p>
    <small>Version: {{t.version}}</small>
  </a>
   </div>
  <hr>
  </div>
  <poller></poller>
  </div>
</template>

<script>
import Poller from './components/Poller'

export default {
  name: 'App',
  components: {
    Poller
  },
  data:function(){
    return {title: 'Site Status Dashboard',
      description: 'This is a poller that executes http requests against specified websites/endpoints and displays the current statuses',
      technologies: [
        {name:'vuejs',description:'Progressive Javacript Framework',version:'2.x',docUrl:'https://vuejs.org'},
        {name:'Azure Functions',description:'Azure Functions is an event-driven, serverless compute platform',version:'1.x',docUrl:'https://azure.microsoft.com/en-us/products/functions/'},
        {name:'Netlify',description:'Build & run dynamic, high performance web applications at global scale—without requiring servers, DevOps, or costly infrastructure.',version:'n/a',docUrl:'https://www.netlify.com/for/web-applications/'}
      ]
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
