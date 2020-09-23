<template>
    <section>
        <navigation></navigation>
        <h5 class="center-align">Profile</h5>

        <div class="card horizontal" style="max-width:400px;margin:0 auto;" v-if="user">
            <div class="card-image" style="margin-top:25px;margin-left:10px;"><img :src="user.photoURL"
                                                                                   style="width:75px;height:75px;border-radius:50%;border:4px solid #333"/>
            </div>
            <div class="card-stacked">
                <div class="card-content">
                    <p> name: <strong>{{(user.displayName == null) ? "None" : user.displayName}}</strong><br/>email:
                        <strong>{{user.email}}</strong><br/>uid:
                        <strong>{{user.uid}}</strong> <br/>provider: <strong
                                class="teal-text">{{user.providerData[0].providerId}}</strong></p>
                    <br/>
                    <p><a
                            class="waves-effect waves-light grey btn tooltipped modal-trigger"
                            href="#clear-bucket-modal"
                            data-position="bottom"
                            data-tooltip="Clear all files from your Bucket..."
                    >
                        <i class="material-icons left">clear_all</i>
                        Clear bucket
                    </a></p>
                    <br/>
                    <p><a
                            class="waves-effect waves-light red btn tooltipped modal-trigger"
                            href="#delete-account-modal"
                            data-position="bottom"
                            data-tooltip="Delete your user account..."
                    >
                        <i class="material-icons left">delete</i>
                        Delete account
                    </a></p>
                </div>
            </div>
        </div>

        <div id="clear-bucket-modal" class="modal">
            <div class="modal-content">
                <h4>Clearing Bucket...</h4>
                <p>Do you really want to clear your Bucket?</p>
                <p>You won't be able to undo this action!</p>
            </div>
            <div class="modal-footer">
                <a
                        href="#!"
                        class="modal-close waves-effect waves-green btn red"
                        @click="onClearBucket"
                >
                    Yes, I'm sure. I know I'll lose all files.
                </a>
                <a href="#!" class="modal-close waves-effect waves-green btn-flat">No, keep my files.</a>
            </div>
        </div>

        <div id="delete-account-modal" class="modal">
            <div class="modal-content">
                <h4>Deleting user account...</h4>
                <p>Do you really want to delete your user account?</p>
                <p>You won't be able to undo this action!</p>
            </div>
            <div class="modal-footer">
                <a
                        href="#!"
                        class="modal-close waves-effect waves-green btn red"
                        @click="onDeleteUserAccount"
                >
                    Yes, I'm sure. I am aware this is final.
                </a>
                <a href="#!" class="modal-close waves-effect waves-green btn-flat">Oh god, no. Cancel</a>
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

            const modals = document.querySelectorAll('.modal');
            const modals_init = M.Modal.init(modals, {});
        },
        created() {
            firebase.auth().onAuthStateChanged(user => {
                //persist the user as data
                if (user) this.user = user;
            });
        },
        methods: {
            onDeleteUserAccount() {
                let currentUser = firebase.auth().currentUser;

                //delete all files in the bucket and remove the user account
                const bucket = firebase
                    .storage()
                    .ref()
                    .child("buckets")
                    .child(currentUser.uid);

                //delete all files in the bucket
                bucket.listAll().then(function (result) {
                    if (result.items.length === 0) {
                        //delete the user account
                        currentUser.delete().then(function () {
                            //user was deleted successfully
                            M.toast({html: 'Deleted account successfully!'});
                        }).catch(function (err) {
                            alert("An error occurred while deleting the account. Try logging out and logging back in!");
                            console.log(err);
                        });

                        return;
                    } else {
                        alert("Your bucket is not empty! Clear it first, then try deleting again.");
                    }

                    result.items.forEach(function (refToDelete) {
                        //delete all files passed, ignore results
                        refToDelete.delete().then(function (index) {

                        });
                    });
                });
            },
            onClearBucket() {
                //remove the URL from the database
                firebase
                    .database()
                    .ref()
                    .child(this.user.uid)
                    .set({
                        url: ""
                    });

                //delete all files in the bucket
                const bucket = firebase
                    .storage()
                    .ref()
                    .child("buckets")
                    .child(this.user.uid);

                //list and remove files
                bucket.listAll().then(function (list) {
                    list.items.forEach(function (item) {
                        item.delete();
                    });

                    M.toast({html: 'Bucket cleared!'});
                }).catch(function (err) {
                    alert("Could not clear the bucket.");
                    console.log(err);
                });
            }
        }
    };
</script>
