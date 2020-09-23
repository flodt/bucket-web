<template>
    <nav>
        <div class="nav-wrapper amber darken-2">
            <!-- <a href="#" class="brand-logo">Logo</a> -->
            <router-link to="/" class="brand-logo left" tag="a" style="padding-left: 10px">
                <i class="material-icons left">home</i>
                Bucket
            </router-link>

            <ul id="nav-mobile" class="right">
                <li v-show="!user">
                    <router-link to="/login">
                        <i class="material-icons left">open_in_browser</i>
                        Login
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
        }
    };
</script>

