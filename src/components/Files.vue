<template>
    <section>
        <navigation></navigation>
        <br/>
        <div class="row" id="file_space">
            <!--<div class="col s12 m3">
                <div
                    class="card-panel"
                >
                    <i class="material-icons left">description</i>

                    Screenshot.png

                    <a class="red btn right waves-effect waves-light" @click.native="onClickDeleteButton"><i class="material-icons">delete</i></a>
                    <a class="amber btn right waves-effect waves-light" @click.native="onClickDownloadButton"><i class="material-icons">file_download</i></a>
                </div>
            </div>-->

            <!--<div class="col s12 m3">
                <div
                        class="card-panel"
                >
                    <i class="material-icons left">description</i>
                    item.name
                </div>
            </div>-->
        </div>
    </section>
</template>

<script>
import navigation from "@/components/NavBar.vue";
import firebase from "firebase";

export default {
    data() {
        return {
            user: null
        };
    },
    components: {
        navigation
    },
    updated() {
        const tooltippeds = document.querySelectorAll('.tooltipped');
        const tooltippeds_init = M.Tooltip.init(tooltippeds, {
            enterDelay: 500
        });
    },
    mounted() {
        //load the files from firebase
        const bucket = firebase
            .storage()
            .ref()
            .child("buckets")
            .child(firebase.auth().currentUser.uid);

        bucket.listAll().then(function (list) {
            for (let item of list.items) {
                const fileItemCard = "<div class=\"col s12 m3\">\n" +
                    "                <div\n" +
                    "                        class=\"card-panel\"\n" +
                    "                >\n" +
                    "                    <i class=\"material-icons left\">description</i>\n" +
                    "                    " + item.name + "\n" +
                    "                </div>\n" +
                    "            </div>";

                document.getElementById("file_space").innerHTML += fileItemCard
            }
        });
    },
    created() {
        firebase.auth().onAuthStateChanged(user => {
            //persist the user as data
            if (user) this.user = user;
        });
    },
    methods: {}
};
</script>
