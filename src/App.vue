<template>
  <div id="app"  class="container">
    <div class=".d-sm-none .d-md-block">
      
    <h3 class="display-5">{{title}}</h3>
  <p class="lead">{{description}}</p>
  <hr class="my-5">
  <h3>Technologies</h3>
 
  <div v-for="t in technologies" class="card">
  <div class="card-header">
    {{t.name}}-{{t.version}}
  </div>
  <div class="card-body">
    <h5 class="card-title"> {{t.name}}t</h5>
    <p class="card-text"> {{t.description}}</p>
    <a :href="t.docUrl" class="btn btn-primary">{{t.name}}</a>
  </div>
</div>
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
