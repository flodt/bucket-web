<template>
    <section>
        <navigation></navigation>
        <br/>
        <div class="row">
            <div class="col s12 m3">
                <div class="card" style="max-width: 400px">
                    <div class="card-image">
                        <img src="static/card_bucket_empty.png">
                        <a class="btn-floating btn-large halfway-fab waves-effect waves-light red"
                           @click="onPickUploadFile"
                        >
                            <i class="material-icons">file_upload</i>
                        </a>
                    </div>
                    <div class="card-content">
                        <span class="card-title">Upload</span>
                        <p>Upload files to your Bucket to share them with your other devices!</p>
                        <input type="file"
                               style="display: none"
                               ref="fileInputUpload"
                               accept="*/*"
                               @change="onUploadFilePicked"
                               multiple
                        >
                        <br/>
                        <div class="progress red" style="display: none" id="uploadProgress">
                            <div class="indeterminate" style="background-color: lightgray"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col s12 m3">
                <div class="card" style="max-width: 400px">
                    <div class="card-image">
                        <img src="static/card_bucket_full.png">
                        <a class="btn-floating btn-large halfway-fab waves-effect waves-light red"
                           style="display: none"
                           id="downloadFilesFAB"
                           @click="onDownloadFiles"
                        >
                            <i class="material-icons">file_download</i>
                        </a>
                    </div>
                    <div class="card-content">
                        <span class="card-title">Download</span>
                        <p>There are currently <strong id="fileCounter">0</strong> files in your Bucket.</p>
                        <p>Download them to this computer!</p>
                        <br/>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    import navigation from "@/components/NavBar.vue";
    import firebase from "firebase";
    import JSZip from 'jszip';
    import * as JSZipUtils from "jszip-utils";

    export default {
        data() {
            return {
                user: null
            };
        },
        components: {
            navigation
        },
        created() {
            firebase.auth().onAuthStateChanged(user => {
                //persist the user as data
                if (user) this.user = user;

                //redirect to the login page if not logged in
                if (!this.user) {
                    this.$router.push({
                        name: "Login"
                    });
                }

                //update the download card
                this.updateDownloadCard();
            });
        },
        methods: {
            /**
             * Called when the upload FAB is clicked
             */
            onPickUploadFile() {
                this.$refs.fileInputUpload.click();
            },
            /**
             * Called when the file selection is completed
             */
            onUploadFilePicked(event) {
                const files = event.target.files;
                if (files.length === 0) return;

                //show progress indicator
                document.getElementById("uploadProgress").style.display = "block";

                //get bucket reference
                const bucket = firebase
                    .storage()
                    .ref()
                    .child("buckets")
                    .child(this.user.uid);

                //delete all files in the bucket
                bucket.listAll().then(function (result) {
                    result.items.forEach(function (refToDelete) {
                        //delete all files passed, ignore results
                        refToDelete.delete()
                    })
                }).then(function () {
                    //upload each selected file
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const ref = bucket.child(file.name);

                        //upload file
                        ref.put(file).then(function (snapshot) {
                            if (i === files.length - 1) {
                                //hide progress indicator
                                document.getElementById("uploadProgress").style.display = "none";

                                //toast upload finished
                                M.toast({html: 'Upload finished!'});

                                //update the download card
                                let amount = files.length;
                                document.getElementById("fileCounter").innerHTML = amount.toString(10);

                                //show or hide the download action button
                                document.getElementById("downloadFilesFAB").style.display = (amount === 0) ? "none" : "block";
                            }
                        });
                    }
                }).catch(function (err) {
                    alert("An error occurred in file upload!");
                    console.log(err);
                    //hide progress indicator
                    document.getElementById("uploadProgress").style.display = "none";
                    this.updateDownloadCard()
                });
            },
            /**
             * Called when the download FAB is clicked
             */
            onDownloadFiles() {
                //list all files in our bucket
                firebase
                    .storage()
                    .ref()
                    .child("buckets")
                    .child(this.user.uid)
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

                                    if (count === list.items.length) {
                                        console.log("Triggering download");
                                        //now trigger the download of the jszip file
                                        zip.generateAsync({type: "blob"}).then(function (content) {
                                            saveAs(content, "bucket.zip");
                                        });
                                    }
                                });
                            }).catch(function (err) {
                                alert("Download failed!");
                                console.log(err);
                            })
                        });

                        //toast download finished
                        M.toast({html: 'Download finished!'});
                    });
            },
            /**
             * Called to update the contents of the download card.
             */
            updateDownloadCard() {
                //setup the download card accordingly
                const bucket = firebase
                    .storage()
                    .ref()
                    .child("buckets")
                    .child(this.user.uid);

                bucket.listAll().then(function (list) {
                    //set the number of files in the bucket to the counter
                    let amount = list.items.length;
                    document.getElementById("fileCounter").innerHTML = amount.toString(10);

                    //show or hide the download action button
                    document.getElementById("downloadFilesFAB").style.display = (amount === 0) ? "none" : "block";
                });
            }
        }
    };
</script>

<style>
</style>
