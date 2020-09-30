<template>
    <section>
        <navigation></navigation>
        <h5 class="center-align">Viewing file bundle</h5>
        <p class="center-align">Bundle ID {{ this.$route.params.bundle }}</p>

        <p class="center-align" style="display: block" id="nothing_here">There seems to be nothing here. The bundle's ID could be invalid.</p>

        <div class="row" id="preloader_container" style="display: none">
            <div class="col s12 m3">
                <div class="card-panel">
                    <div class="progress">
                        <div class="determinate" style="width: 0" id="bundleDownloadProgressBar"></div>
                    </div>
                    <div style="text-align: center; font-weight: bold; display: block" id="bundleDownloadProgressText">
                        Downloading file 0/0... (0%)
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

        <div class="fixed-action-btn">
            <a
                class="btn-floating btn-large red tooltipped"
                data-tooltip="Download files..."
                data-position="left"
                @click="onDownloadBundle"
            >
                <i class="large material-icons">file_download</i>
            </a>
        </div>
    </section>
</template>

<script>
import navigation from "@/components/NavBar.vue";
import firebase from "firebase";
import JSZip from "jszip";
import * as JSZipUtils from "jszip-utils";

export default {
    name: "Bundles",
    data() {
        return {};
    },
    components: {
        navigation
    },
    mounted() {
        this.init();
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

            try { //load the files from firebase path /bundles/<bundle id>/
                const bucket = firebase
                    .storage()
                    .ref()
                    .child("bundles")
                    .child(this.$route.params.bundle);

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

                        //add the file card to the element
                        document.getElementById("file_space").innerHTML += fileItemCard;
                    }
                });
            } catch (e) {
                //FirebaseStorageError caught. bundle ID is likely invalid.
                console.log("Invalid bundle ID received...");
                document.getElementById("nothing_here").style.display = "block";
            }
        },
        onDownloadBundle() {
            //show the progress bar and toast downloading
            document.getElementById("preloader_container").style.display = "block";

            //list all files in our bucket
            firebase
                .storage()
                .ref()
                .child("bundles")
                .child(this.$route.params.bundle)
                .listAll()
                .then(function (list) {
                    //download all the file references
                    let zip = new JSZip();

                    let count = 0;

                    list.items.forEach(function (file) {
                        file.getDownloadURL().then(function (url) {
                            JSZipUtils.getBinaryContent(url, function (err, data) {
                                console.log(`Zipping file…`);
                                console.log(err);
                                zip.file(file.name, data, {binary: true});
                                count++;

                                //update progress bar
                                document.getElementById("bundleDownloadProgressBar").className = "determinate";
                                let totalProgress = (count / list.items.length) * 100;
                                console.log("Total download progress: " + totalProgress);
                                document.getElementById("bundleDownloadProgressBar").style.width = totalProgress + "%";
                                document.getElementById("bundleDownloadProgressText").innerText
                                    = "Downloading file " + count + "/" + list.items.length + "... (" + totalProgress.toFixed(2) + "%)";

                                if (count === list.items.length) {
                                    //set progress bar to indeterminate
                                    document.getElementById("bundleDownloadProgressBar").className = "indeterminate";

                                    //announce archive generation
                                    document.getElementById("bundleDownloadProgressText").innerText
                                        = "Generating zip archive...";

                                    //now trigger the download of the jszip file
                                    zip.generateAsync({type: "blob"}).then(function (content) {
                                        saveAs(content, "bundle.zip");
                                        M.toast({html: 'Download finished!'});
                                        document.getElementById("preloader_container").style.display = "none";
                                    });
                                }
                            });
                        }).catch(function (err) {
                            alert("Download failed!");
                            document.getElementById("preloader_container").style.display = "none";
                            console.log(err);
                        })
                    });
                });
        }
    }
};
</script>

<style>
</style>
