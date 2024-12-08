import { createRouter, createWebHistory } from 'vue-router';
import MainContent from '../components/MainContent.vue'; // 主页
import Login from '../components/user/log_on.vue'; // 登录组件
import Register from "../components/user/register.vue";
import user_center from "../components/user_center/user_center.vue";
import UserProfile from "../components/user_center/UserProfile.vue";
import Notice from "../components/user_center/notice.vue";
import Chat from "../components/plan/Chat.vue";
import UnderConstruction from "../components/UnderConstruction.vue"; // 正在施工的组件

const routes = [
    {
        path: '/',
        name: 'home',
        component: MainContent,
        props: { currentSection: 'home' }, // 这里也可以传递 props
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
    },
    {
        path: '/register',
        name: 'register',
        component: Register,
    },
    {
        path: '/user_center',
        name: 'user_center',
        component: user_center,
        children: [
            {
                path: '',
                name: 'user_profile',
                component: UserProfile,
            },
            {
                path: "notice",
                name: "notice",
                component: Notice,
            }
        ]
    },
    {
        path: '/plan',
        name: 'plan',
        component: Chat,
    },
    {
        path: '/news',
        name: 'news',
        component: UnderConstruction,
        props: { pageName: '美食新闻' }, // 传递 pageName 给 UnderConstruction
    },
    {
        path: '/recipes',
        name: 'recipes',
        component: UnderConstruction,
        props: { pageName: '食谱库' }, // 传递 pageName 给 UnderConstruction
    },
    {
        path: '/nutrition',
        name: 'nutrition',
        component: UnderConstruction,
        props: { pageName: '营养分析' }, // 传递 pageName 给 UnderConstruction
    },
    {
        path: '/UnderConstruction',
        name: 'UnderConstruction',
        component: UnderConstruction,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
