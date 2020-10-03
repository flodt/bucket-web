<template>
    <section>
        <navigation></navigation>
        <br/>
        <div class="row">
            <div class="col s12 m4 l3">
                <div class="card" style="max-width: 400px" id="uploadDropZone">
                    <div class="card-image">
                        <img src="static/card_bucket_empty.png">
                        <a class="btn-floating btn-large halfway-fab waves-effect waves-light red tooltipped"
                           data-tooltip="Upload file(s) here..."
                           data-position="bottom"
                           @click="onPickUploadFile"
                        >
                            <i class="material-icons">file_upload</i>
                        </a>
                    </div>
                    <div class="card-content">
                        <span class="card-title">Upload</span>
                        <p>Upload files to your Bucket to share them with your other devices!</p>
                        <!-- this should accept="*/*" -->
                        <input type="file"
                               style="display: none"
                               ref="fileInputUpload"
                               id="fileInputUploadId"
                               @change="onUploadFilePicked"
                               multiple
                        >
                        <br/>
                        <div class="progress" style="display: none" id="uploadProgress">
                            <div class="determinate" style="width: 0" id="uploadProgressBar"></div>
                        </div>
                        <div style="text-align: center; font-weight: bold; display: none" id="uploadProgressText">
                            Uploading file 0/0... (0%)
                        </div>
                    </div>
                </div>
            </div>

            <div class="col s12 m4 l3">
                <div class="card" style="max-width: 400px">
                    <div class="card-image">
                        <img src="static/card_bucket_full.png">
                        <a class="btn-floating btn-large halfway-fab waves-effect waves-light red tooltipped"
                           data-tooltip="Download file(s) here..."
                           data-position="bottom"
                           style="display: none"
                           id="downloadFilesFAB"
                           @click="onDownloadFiles"
                        >
                            <i class="material-icons">file_download</i>
                        </a>
                    </div>
                    <div class="card-content">
                        <span class="card-title">Download</span>
                        <p>There are <strong id="fileCounter">0</strong> files in your Bucket.</p>
                        <p>Download them to this computer!</p>
                        <br/>
                        <div class="progress" style="display: none" id="downloadProgress">
                            <div class="determinate" style="width: 0" id="downloadProgressBar"></div>
                        </div>
                        <div style="text-align: center; font-weight: bold; display: none" id="downloadProgressText">
                            Downloading file 0/0... (0%)
                        </div>
                    </div>
                </div>
            </div>

            <div class="col s12 m4 l3">
                <div class="card" style="max-width: 400px">
                    <div class="card-image">
                        <img src="static/card_bucket_link.png">
                        <a class="btn-floating btn-large halfway-fab waves-effect waves-light red tooltipped"
                           data-tooltip="Open the transferred URL..."
                           data-position="bottom"
                           id="openURLFAB"
                           style="display: none"
                           @click="onOpenURL"
                        >
                            <i class="material-icons">open_in_new</i>
                        </a>
                    </div>
                    <div class="card-content">
                        <span class="card-title">Transfer URLs</span>
                        <p>
                            Share URLs to other devices here. <strong style="display: none" id="openURLText">Open the transferred
                            link.</strong>
                        </p>
                        <br/>

                        <div class="input-field">
                            <i class="material-icons prefix">link</i>
                            <input id="enter_url" type="text" class="validate">
                            <label for="enter_url">Enter URL...</label>
                        </div>
                        <a
                                id="submit_url_button"
                                class="btn red waves-effect waves-light"
                                style="display: none; alignment: center"
                                @click="onSubmitURL"
                        >
                            Submit
                        </a>
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
        mounted() {
            const elems = document.querySelectorAll('.tooltipped');
            const instances = M.Tooltip.init(elems, {});
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

                //enable drag-drop file upload
                let dropContainer = document.getElementById("uploadDropZone");
                dropContainer.ondragover = dropContainer.ondragenter = function (event) {
                    //stop propagation, we'll handle this ourselves
                    event.preventDefault();
                    event.stopPropagation();
                };

                let vm = this;

                dropContainer.ondrop = function (event) {
                    event.preventDefault();
                    let fileInput = document.getElementById("fileInputUploadId");
                    fileInput.files = event.dataTransfer.files;
                    vm.onUploadFilePicked();
                };

                //add enter key event
                document.getElementById("enter_url").addEventListener('keyup', function (event) {
                    if (event.code === 'Enter') {
                        event.preventDefault();
                        event.stopPropagation();
                        document.getElementById("submit_url_button").click();
                    }
                });
            });
        },
        methods: {
            /**
             * Called when the open URL FAB is clicked.
             */
            onOpenURL() {
                firebase
                    .database()
                    .ref()
                    .child(this.user.uid)
                    .once('value')
                    .then(function (snapshot) {
                        const databaseUrl = snapshot.val() && snapshot.val().url || "";

                        try {
                            new URL(databaseUrl);
                            window.open(databaseUrl);
                            M.toast({html: `Opening URL…`});
                        } catch (_) {
                            M.toast({html: `The shared URL was invalid.`});
                        }
                    });
            },
            /**
             * Called when the URL field is submitted.
             */
            onSubmitURL() {
                let inputContent = document.getElementById("enter_url").value;

                try {
                    new URL(inputContent);
                    firebase
                        .database()
                        .ref()
                        .child(this.user.uid)
                        .set({
                            url: inputContent
                        });

                    this.updateDownloadCard();
                    M.toast({html: `URL has been submitted.`});
                } catch (_) {
                    M.toast({html: `That is not a valid URL!`});
                }
            },
            /**
             * Called when the upload FAB is clicked
             */
            onPickUploadFile() {
                this.$refs.fileInputUpload.click();
            },
            /**
             * Called when the file selection is completed
             */
            onUploadFilePicked() {
                const files = document.getElementById("fileInputUploadId").files;
                if (files.length === 0) return;

                M.toast({html: `Uploading ${files.length} file(s)…`});

                //show progress indicator
                document.getElementById("uploadProgress").style.display = "block";
                document.getElementById("uploadProgressText").style.display = "block";

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
                    let count = 0;
                    let individualProgress = new Array(files.length);

                    //upload each selected file
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
                            document.getElementById("uploadProgressBar").style.width = totalProgress + "%";
                            document.getElementById("uploadProgressText").innerText
                                = "Uploading file " + alreadyFinished + "/" + files.length + "... (" + totalProgress.toFixed(1) + "%)";
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
                                document.getElementById("uploadProgress").style.display = "none";
                                document.getElementById("uploadProgressText").style.display = "none";

                                //toast upload finished
                                M.toast({html: 'Upload finished!'});

                                //update the download card
                                let amount = files.length;
                                document.getElementById("fileCounter").innerHTML = amount.toString();

                                //show or hide the download action button
                                document.getElementById("downloadFilesFAB").style.display = (amount === 0) ? "none" : "block";
                            }
                        })
                    }
                }).catch(function (err) {
                    alert("An error occurred in file upload!");
                    console.log(err);
                    //hide progress indicator
                    document.getElementById("uploadProgress").style.display = "none";
                    document.getElementById("uploadProgressText").style.display = "none";
                    this.updateDownloadCard()
                });
            },
            /**
             * Called when the download FAB is clicked
             */
            onDownloadFiles() {
                //show the progress bar and toast downloading
                document.getElementById("downloadProgress").style.display = "block";
                document.getElementById("downloadProgressText").style.display = "block";
                M.toast({html: 'Downloading...'});

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

                                    //update progress bar
                                    document.getElementById("downloadProgressBar").className = "determinate";
                                    let totalProgress = (count / list.items.length) * 100;
                                    console.log("Total download progress: " + totalProgress);
                                    document.getElementById("downloadProgressBar").style.width = totalProgress + "%";
                                    document.getElementById("downloadProgressText").innerText
                                        = "Downloading file " + count + "/" + list.items.length + "... (" + totalProgress.toFixed(1) + "%)";

                                    if (count === list.items.length) {
                                        //set progress bar to indeterminate
                                        document.getElementById("downloadProgressBar").className = "indeterminate";

                                        //announce archive generation
                                        document.getElementById("downloadProgressText").innerText
                                            = "Generating zip archive...";

                                        //now trigger the download of the jszip file
                                        zip.generateAsync({type: "blob"}).then(function (content) {
                                            saveAs(content, "bucket.zip");
                                            M.toast({html: 'Download finished!'});
                                            document.getElementById("downloadProgress").style.display = "none";
                                            document.getElementById("downloadProgressText").style.display = "none";
                                        });
                                    }
                                });
                            }).catch(function (err) {
                                alert("Download failed!");
                                document.getElementById("downloadProgress").style.display = "none";
                                console.log(err);
                            })
                        });
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

                //update the URL display
                firebase
                    .database()
                    .ref()
                    .child(this.user.uid)
                    .once('value')
                    .then(function (snapshot) {
                        const databaseUrl = snapshot.val() && snapshot.val().url || "";

                        if (databaseUrl !== "") {
                            document.getElementById("openURLFAB").style.display = "block";
                            document.getElementById("openURLText").style.display = "inline";
                            document.getElementById("enter_url").value = databaseUrl;
                            M.updateTextFields();
                        } else {
                            document.getElementById("openURLFAB").style.display = "none";
                            document.getElementById("openURLText").style.display = "none";
                        }
                    });
            }
        }
    };
</script>

<style>
</style>
