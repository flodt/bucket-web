<template>
    <nav>
        <div class="nav-wrapper amber darken-2">
            <!-- <a href="#" class="brand-logo">Logo</a> -->
            <router-link to="/" class="brand-logo left" tag="a" style="padding-left: 10px">
                <i class="material-icons left">home</i>
                Bucket
            </router-link>

            <ul id="nav-mobile" class="right hide-on-small-and-down">
                <li v-show="!user">
                    <router-link to="/login">
                        <i class="material-icons left">open_in_browser</i>
                        Login
                    </router-link>
                </li>
                <li v-show="user">
                    <router-link to="/files">
                        <i class="material-icons left">folder</i>
                        Files
                    </router-link>
                </li>
                <li v-show="user">
                    <router-link to="/share">
                        <i class="material-icons left">share</i>
                        Share
                    </router-link>
                </li>
                <li v-show="user">
                    <router-link to="/profile">
                        <i class="material-icons left">person</i>
                        Profile
                    </router-link>
                </li>
                <li v-show="user">
                    <a @click="logout">
                        <i class="material-icons left">exit_to_app</i>
                        Logout
                    </a>
                </li>
            </ul>
            <a href="#" data-target="sidenav_mobile" class="sidenav-trigger right hide-on-med-and-up"><i class="material-icons">menu</i></a>

            <ul class="sidenav" id="sidenav_mobile">
                <li v-show="user"><div class="user-view">
                    <div class="background">
                        <img src="/static/gradient_strong.png" alt="Gradient">
                    </div>
                    <h4>Bucket</h4>
                    <br/>
                </div></li>
                <li v-show="!user">
                    <router-link to="/login" class="sidenav-close">
                        <i class="material-icons left">open_in_browser</i>
                        Login
                    </router-link>
                </li>

                <li>
                    <router-link to="/" class="sidenav-close">
                        <i class="material-icons left">home</i>
                        Home
                    </router-link>
                </li>
                <li v-show="user">
                    <a class="subheader">Manage your Bucket</a>
                </li>
                <li v-show="user">
                    <router-link to="/files" class="sidenav-close">
                        <i class="material-icons left">folder</i>
                        Files
                    </router-link>
                </li>
                <li v-show="user">
                    <router-link to="/profile" class="sidenav-close">
                        <i class="material-icons left">person</i>
                        Profile
                    </router-link>
                </li>
                <li v-show="user">
                    <a class="subheader">Share with others</a>
                </li>
                <li v-show="user">
                    <router-link to="/share" class="sidenav-close">
                        <i class="material-icons left">share</i>
                        Share
                    </router-link>
                </li>
                <li v-show="user">
                    <a class="subheader">Exit</a>
                </li>
                <li v-show="user">
                    <a @click="logout" class="sidenav-close">
                        <i class="material-icons left">exit_to_app</i>
                        Logout
                    </a>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script>
    import firebase from "firebase";

    export default {
        methods: {
            logout(e) {
                e.stopPropagation();
                //sign the user out, move to login page
                firebase.auth().signOut();
                this.$router.push({
                    name: "Login"
                });
            }
        },
        data() {
            return {
                user: null
            };
        },
        created() {
            firebase.auth().onAuthStateChanged(user => {
                this.user = user;
            });
        },
        mounted() {
            const sidenavs = document.querySelectorAll('.sidenav');
            const sidenavs_init = M.Sidenav.init(sidenavs, {});
        }
    };
</script>

