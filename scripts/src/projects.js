import Vue from 'vue';
import Project from '../scripts/dist/entities/project';

const vue = new Vue({
    el: '#app',
    data: {
        projects: []
    },
    attached() {
        this.projects = new Project().all();
    },
    methods: {
        renderCreateProjectView() {
            location.href = 'create-project.html';
        },
        renderManageView(projectId) {
            location.href = `manage.html?projectId=${projectId}`;
        }
    }
});
