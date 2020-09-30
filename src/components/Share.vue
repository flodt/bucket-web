<template>
    <section>
        <navigation></navigation>
        <h5 class="center-align">Share a bundle</h5>

        <p class="center-align" style="display: block" id="nothing_here">There seems to be nothing here. Add some files
            to share them with others.</p>
        <p class="center-align">Bundle ID: {{ this.bundleId }}</p>

        <div class="row" id="preloader_container" style="display: none">
            <div class="col s12 m3">
                <div class="card-panel">
                    <div class="progress">
                        <div class="determinate" style="width: 0" id="noDeleteUploadProgressBar"></div>
                    </div>
                    <div style="text-align: center; font-weight: bold; display: block" id="noDeleteUploadProgressText">
                        Uploading file 0/0... (0%)
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
            <a class="btn-floating btn-large red modal-trigger" @click="onShareAsBundle" href="#share-as-bundle-modal">
                <i class="large material-icons">mode_edit</i>
            </a>
            <ul>
                <!--<li><a class="btn-floating red tooltipped" data-tooltip="Delete all files..." data-position="left"><i class="material-icons">delete_sweep</i></a></li>-->
                <li><a class="btn-floating green tooltipped modal-trigger" data-tooltip="Share contents as a bundle..."
                       data-position="left" @click="onShareAsBundle" href="#share-as-bundle-modal"
                ><i class="material-icons">share</i></a></li>
                <li><a class="btn-floating orange tooltipped" data-tooltip="Add files to the bundle..."
                       data-position="left" @click="onNoDeleteUpload"><i class="material-icons">add</i></a></li>
            </ul>
        </div>

        <div id="share-as-bundle-modal" class="modal">
            <div class="modal-content">
                <h4>Share as bundle</h4>
                <p>Share the URL to the bundle below!</p>
                <div class="input-field" style="display: block">
                    <i class="material-icons prefix">link</i>
                    <input id="share_url" type="text" class="validate">
                    <label for="share_url">Bundle URL...</label>
                </div>
            </div>
            <div class="modal-footer">
                <a href="#!" class="modal-close waves-effect waves-green btn-flat">Finish</a>
            </div>
        </div>
    </section>
</template>

<script>
import navigation from "@/components/NavBar.vue";
import firebase from "firebase";

export default {
    data() {
        return {
            user: null,
            bundleId: null
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

            //enable drag-drop file upload
            let dropContainer = window;
            dropContainer.ondragover = dropContainer.ondragenter = function (event) {
                //stop propagation, we'll handle this ourselves
                event.preventDefault();
                event.stopPropagation();
            };

            let vm = this;

            dropContainer.ondrop = function (event) {
                event.preventDefault();
                let fileInput = document.getElementById("noDeleteUploadId");
                fileInput.files = event.dataTransfer.files;
                vm.onNoDeleteUploadPicked();
            };

            //generate the uid for this bundle
            this.bundleId = uuidv4();

            //update the file view
            this.loadFiles();
        },
        loadFiles() {
            //load the files from firebase
            const bucket = firebase
                .storage()
                .ref()
                .child("bundles")
                .child(this.bundleId);

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
                .child("bundles")
                .child(this.bundleId);

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
                            = "Uploading file " + alreadyFinished + "/" + files.length + "... (" + totalProgress.toFixed(2) + "%)";
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
                            vm.loadFiles();
                        }
                    })
                }
            } catch (err) {
                alert("An error occurred in file upload!");
                console.log(err);

                //hide the progress bar
                document.getElementById("preloader_container").style.display = "none";
            }
        },
        onShareAsBundle() {
            M.toast({html: 'Sharing as bundle...'});

            document.getElementById("share_url").value = `https://bucket.schmidt-allgaeu.de/bundles/${this.bundleId}`;
            M.updateTextFields();
        }
    }
};

/**
 * Sourced from https://stackoverflow.com/questions/105034/how-to-create-guid-uuid.
 */
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

/**
 * Sourced from https://stackoverflow.com/questions/14071463/how-can-i-merge-typedarrays-in-javascript.
 */
function mergeTypedArrays(a, b) {
    // Checks for truthy values on both arrays
    if (!a && !b) throw 'Please specify valid arguments for parameters a and b.';

    // Checks for truthy values or empty arrays on each argument
    // to avoid the unnecessary construction of a new array and
    // the type comparison
    if (!b || b.length === 0) return a;
    if (!a || a.length === 0) return b;

    // Make sure that both typed arrays are of the same type
    if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b))
        throw 'The types of the two arguments passed for parameters a and b do not match.';

    const c = new a.constructor(a.length + b.length);
    c.set(a);
    c.set(b, a.length);

    return c;
}
</script>
