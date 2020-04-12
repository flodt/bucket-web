// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import firebase from 'firebase'

//firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB8xfqT3jUpY51Tb7pXG8Gt5PtVG4nJdRg",
    authDomain: "bucket-47f81.firebaseapp.com",
    databaseURL: "https://bucket-47f81.firebaseio.com",
    projectId: "bucket-47f81",
    storageBucket: "bucket-47f81.appspot.com",
    messagingSenderId: "1005126071806",
    appId: "1:1005126071806:web:53a039fb939ae686913caf",
    measurementId: "G-DGC9R1S4R4"
};

//initialize firebase for our project
firebase.initializeApp(firebaseConfig);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: {App},
    template: '<App/>'
});
