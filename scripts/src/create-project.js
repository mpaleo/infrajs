import {
    remote
} from 'electron';
import path from 'path';
import uuid from 'node-uuid';
import Vue from 'vue';
import Git from 'simple-git';
import String from 'lodash/string';
import Project from '../scripts/dist/entities/project';
import View from '../scripts/dist/utils/view';
import Snackbar from '../scripts/dist/utils/snackbar';

const vue = new Vue({
    el: '#app',
    data: {
        containers: {
            appLang: [{
                name: 'PHP',
                image: 'php:7-fpm-alpine',
                layer: 'lang',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                color: '#3f51b5',
                disabled: false
            }, {
                name: 'HHVM',
                image: 'not-yet',
                layer: 'lang',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                color: '#FF9800',
                disabled: true
            }, {
                name: 'Ruby',
                image: 'not-yet',
                layer: 'lang',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                color: '#CC342D',
                disabled: true
            }],

            extras: [{
                name: 'NodeJS',
                image: 'not-yet',
                layer: 'extra',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                color: '#4caf50',
                disabled: false
            }],

            cache: [{
                name: 'Redis',
                image: 'redis:3-alpine',
                layer: 'cache',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                color: '#e53935',
                disabled: true
            }, {
                name: 'Memcached',
                image: 'memcached',
                layer: 'cache',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                color: '#8d6e63',
                disabled: true
            }],

            storage: [{
                name: 'MariaDB',
                image: 'mariadb',
                layer: 'database',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                color: '#0d47a1',
                disabled: false
            }, {
                name: 'MySQL',
                image: 'not-yet',
                layer: 'database',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                color: '#ffa000',
                disabled: true
            }],

            servers: [{
                name: 'Nginx',
                image: 'nginx:alpine',
                layer: 'server',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                color: '#1b5e20',
                disabled: false
            }, {
                name: 'Apache',
                image: 'not-yet',
                layer: 'server',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                color: '#d81b60',
                disabled: true
            }]
        },

        project: {
            id: uuid(),
            name: '',
            description: '',
            codePath: '',
            containers: []
        }
    },
    methods: {
        create() {
            if (String.startsWith(this.project.codePath, 'https://') && String.endsWith(this.project.codePath, '.git')) { // Git repo
                Snackbar.show('Creating project - Cloning repository');

                const localPath = path.join(remote.app.getPath('desktop'), `infrajs-code/${this.project.id}`);

                Git().clone(this.project.codePath, localPath, () => {
                    Snackbar.show('Creating project - Cloned');
                });

                this.project.codePath = localPath;
            } else { // Local path
                Snackbar.show('Creating project - Local code');
            }

            Snackbar.show('Done');

            new Project().create(this.project);

            // Render projects
            View.render('projects');
        }
    }
});
