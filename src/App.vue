<template>
  <div id="app"  class="container">
    <div class=".d-sm-none .d-md-block">
      
    <h3 class="display-5">{{title}}</h3>
  <p class="lead">{{description}}</p>
  <hr class="my-5">
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
