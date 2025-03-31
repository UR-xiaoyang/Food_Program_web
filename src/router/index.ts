import { createRouter, createWebHistory } from 'vue-router';
import MainContent from "@/components/MainContent.vue";  // 使用@别名
import Login from '../components/user/log_on.vue'; // 登录组件
import Register from "../components/user/register.vue";
import user_center from "../components/user_center/user_center.vue";
import UserProfile from "../components/user_center/UserProfile.vue";
import Chat from "../components/plan/Chat.vue";
import UnderConstruction from "../components/UnderConstruction.vue"; // 正在施工的组件
import NutritionAnalysis from "../components/nutrition/NutritionAnalysis.vue"; // 营养分析组件

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
        ]
    },
    {
        path: '/plan',
        name: 'plan',
        component: Chat,
    },
    {
        path: '/nutrition',
        name: 'nutrition',
        component: NutritionAnalysis,
    },
    {
        path: '/UnderConstruction',
        name: 'UnderConstruction',
        component: UnderConstruction,
    },
    {
        path: '/planList',
        name: 'planList',
        component: () => import('../components/plan_list/PlanList.vue'),
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
