<template>
    <section>
        <navigation></navigation>
        <br/>

        <p class="center-align" style="display: block" id="nothing_here">There seems to be nothing here. Upload a file
            via the home tab.</p>

        <div class="row" id="preloader_container" style="display: none">
            <div class="col s12 m3">
                <div class="card-panel">
                    <div class="progress">
                        <div class="determinate" style="width: 0" id="noDeleteUploadProgressBar"></div>
                    </div>
                    <div style="text-align: center; font-weight: bold; display: block" id="noDeleteUploadProgressText">
                        Uploading 0/0... (0%)
                    </div>
                </div>
            </div>
        </div>

        <div class="row" id="file_space">
            <!--<div class="col s12 m3">
                <div
                        class="card-panel"
                >
                    <i class="material-icons left">description</i>
                    item.name
                </div>
            </div>-->
        </div>

        <input type="file"
               style="display: none"
               ref="noDeleteUpload"
               id="noDeleteUploadId"
               @change="onNoDeleteUploadPicked"
               multiple
        >

        <div class="fixed-action-btn">
            <a class="btn-floating btn-large red">
                <i class="large material-icons">mode_edit</i>
            </a>
            <ul>
                <!--<li><a class="btn-floating red tooltipped" data-tooltip="Delete all files..." data-position="left"><i class="material-icons">delete_sweep</i></a></li>-->
                <li><a class="btn-floating blue tooltipped" data-tooltip="Upload without clearing files..."
                       data-position="left" @click="onNoDeleteUpload"><i class="material-icons">file_upload</i></a></li>
            </ul>
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
    mounted() {
        this.init();
    },
    created() {
        firebase.auth().onAuthStateChanged(user => {
            //persist the user as data
            if (user) this.user = user;
        });
    },
    methods: {
        init() {
            const tooltippeds = document.querySelectorAll('.tooltipped');
            const tooltippeds_init = M.Tooltip.init(tooltippeds, {
                enterDelay: 200,
                exitDelay: 0
            });

            const floatings = document.querySelectorAll('.fixed-action-btn');
            const floatings_init = M.FloatingActionButton.init(floatings, {});

            const modals = document.querySelectorAll('.modal');
            const modals_init = M.Modal.init(modals, {});

            //load the files from firebase
            const bucket = firebase
                .storage()
                .ref()
                .child("buckets")
                .child(firebase.auth().currentUser.uid);

            //show the nothing here text
            document.getElementById("nothing_here").style.display = "block";

            bucket.listAll().then(function (list) {
                document.getElementById("file_space").innerHTML = "";
                for (let item of list.items) {
                    //hide the nothing here text
                    document.getElementById("nothing_here").style.display = "none";

                    const fileItemCard = "<div class=\"col s12 m3\">\n" +
                        "                <div\n" +
                        "                        class=\"card-panel\"\n" +
                        "                >\n" +
                        "                    <i class=\"material-icons left\">description</i>\n" +
                        "                    " + item.name + "\n" +
                        "                </div>\n" +
                        "            </div>";

                    document.getElementById("file_space").innerHTML += fileItemCard;
                }
            });
        },
        onNoDeleteUpload() {
            this.$refs.noDeleteUpload.click();
        },
        onNoDeleteUploadPicked() {
            //show upload progress bar
            document.getElementById("preloader_container").style.display = "block";

            const vm = this;

            const files = document.getElementById("noDeleteUploadId").files;
            if (files.length === 0) return;

            M.toast({html: `Uploading ${files.length} file(s)…`});

            //get bucket reference
            const bucket = firebase
                .storage()
                .ref()
                .child("buckets")
                .child(this.user.uid);

            let count = 0;
            let individualProgress = new Array(files.length);

            try { //upload each selected file
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const ref = bucket.child(file.name);
                    individualProgress[i] = 0;

                    //upload file
                    const uploadTask = ref.put(file);
                    uploadTask.on('state_changed', function (snapshot) {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        individualProgress[i] = progress;
                        console.log("Upload task " + i + " is " + progress + " % done");
                        console.log(individualProgress);

                        //number of already finished files is the number of 100s in the array
                        let alreadyFinished = 0;
                        individualProgress.forEach(value => alreadyFinished += (value === 100) ? 1 : 0);

                        //update the progress bar
                        const totalProgress = individualProgress.reduce((a, b) => a + b, 0) / individualProgress.length;
                        document.getElementById("noDeleteUploadProgressBar").style.width = totalProgress + "%";
                        document.getElementById("noDeleteUploadProgressText").innerText
                            = "Uploading " + alreadyFinished + "/" + files.length + "... (" + totalProgress.toFixed(1) + "%)";
                    }, function (error) {
                        //continue propagation of error
                        throw error;
                    }, function () {

                    });
                    uploadTask.then(function () {
                        //update counter and toast progress
                        count++;

                        if (count === files.length) {
                            //hide progress indicator
                            //document.getElementById("uploadProgress").style.display = "none";
                            //document.getElementById("uploadProgressText").style.display = "none";

                            //toast upload finished
                            M.toast({html: 'Upload finished!'});

                            //hide the progress bar
                            document.getElementById("preloader_container").style.display = "none";

                            //update the page
                            vm.init();
                        }
                    })
                }
            } catch (err) {
                alert("An error occurred in file upload!");
                console.log(err);

                //hide the progress bar
                document.getElementById("preloader_container").style.display = "none";
            }
        }
    }
};
</script>
