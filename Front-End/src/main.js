import { createApp } from 'vue';
import {createWebHistory, createRouter} from 'vue-router';
import axios from 'axios';
import App from './App.vue';
import Home from './Home.vue';
import Search from './Search.vue';
import Events from './Events.vue';
import OneEvent from "./OneEvent";
import Login from './Login';
import Register from './Register';
import CreateEvent from "./CreateEvent";
import Organising from "./Organising";
import Attending from "./Attending";
import MyEvent from "./MyEvent";
import ControlAttendance from "@/components/ControlAttendance";
import MyProfile from "@/MyProfile";

const routes = [
    {
        path: "/",
        name: 'home',
        component: Home
    },
    {
        path: "/search",
        name: 'search',
        component: Search
    },
    {
        path: "/events",
        name: 'events',
        component: Events
    },

    {
        path: "/users/login",
        name: 'login',
        component: Login
    },
    {
        path: "/users/register",
        name: 'register',
        component: Register
    },
    {
        path: "/events/create",
        name: 'createEvent',
        component: CreateEvent
    },
    {
        path: "/events/organising",
        name: 'organisingEvents',
        component: Organising
    },
    {
        path: "/events/attending",
        name: "attendingEvents",
        component: Attending
    },
    {
        path: "/events/organising/:eventId",
        name: "myEvent",
        component: MyEvent
    },
    {
        path: "/events/:eventId/attendees",
        name: "eventAttendees",
        component: ControlAttendance
    },
    {
        path: "/users/profile",
        name: "myProfile",
        component: MyProfile
    },
    {
        path: "/events/:eventId",
        name: 'event',
        component: OneEvent
    },
];

const router = createRouter({
    routes,
    history: createWebHistory()
});

const app = createApp(App)
app.use(router);
app.config.globalProperties.axios = axios;
app.mount('#app')
