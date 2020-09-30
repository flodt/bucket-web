import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Profile from '@/components/Profile'
import Files from '@/components/Files'
import Share from '@/components/Share'
import Bundles from '@/components/Bundles'
import firebase from "firebase";

Vue.use(Router);

let router = new Router({
        mode: 'history',

        routes: [
            {
                path: '/profile',
                name: 'Profile',
                component: Profile,
                meta: {
                    auth: true
                }

            },
            {
                path: '/login',
                name: 'Login',
                component: Login,
                meta: {
                    guest: true
                }

            },
            {
                path: '/bundles/:bundle',
                name: 'Bundles',
                component: Bundles
            },
            {
                path: '/',
                name: 'Home',
                component: Home,

            },
            {
                path: '/files',
                name: 'Files',
                component: Files,
                meta: {
                    auth: true
                }
            },
            {
                path: '/share',
                name: 'Share',
                component: Share,
                meta: {
                    auth: true
                }
            }
        ]

    },
);


router.beforeEach((to, from, next) => {

    if (to.matched.some(record => record.meta.auth)) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                next()
            } else {
                next({
                    path: "/login",
                })
            }
        })
    } else if (to.matched.some(record => record.meta.guest)) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                next({
                    path: "/profile",
                })
            } else {
                next()
            }
        })

    } else {
        next()
    }

});

export default router
