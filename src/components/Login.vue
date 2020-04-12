<template>
    <section>
        <navigation></navigation>
        <h5 class="center-align">Login</h5>
        <section id="firebaseui-auth-container"></section>
    </section>
</template>

<script>
import navigation from "@/components/NavBar.vue";
import firebase from "firebase";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";

export default {
    name: "Login",
    data() {
        return {};
    },
    components: {
        navigation
    },
    mounted() {
        //when the vue is mounted, show the UI
        let ui = firebaseui.auth.AuthUI.getInstance();
        if (!ui) {
            //only create a new instance if it does not yet exist
            ui = new firebaseui.auth.AuthUI(firebase.auth());
        }

        //ui configuration see documentation
        var uiConfig = {
            signInSuccessUrl: '/',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID
            ]
        };

        ui.start("#firebaseui-auth-container", uiConfig);
    }
};
</script>

<style>
</style>
