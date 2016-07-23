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
        stacks: [{
            name: 'PHP Apache',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
            disabled: false,
            color: '#3f51b5',
            mainContainer: 3,
            containers: [{
                name: 'MySQL',
                version: '5.7.13',
                doc: 'https://hub.docker.com/',
                official: true,
                rapi: {
                    Image: 'mysql:5',
                    Env: ['MYSQL_ROOT_PASSWORD=password', 'MYSQL_DATABASE=wordpress']
                },
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                layer: 'database',
                linkId: 1,
                links: []
            }, {
                name: 'Redis',
                version: '3.2.1',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                layer: 'cache',
                doc: 'https://hub.docker.com/_/redis/',
                official: true,
                rapi: {
                    Image: 'redis:3-alpine'
                },
                linkId: 2,
                links: []
            }, {
                name: 'PHP',
                version: '7.0.8',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                layer: 'lang',
                doc: 'https://hub.docker.com/',
                official: true,
                rapi: {
                    Image: 'php:7-apache',
                    HostConfig: {
                        Binds: ['{{CODE_PATH}}:/var/www/html'],
                        Links: ['{{1}}:database', '{{2}}:cache'],
                        PortBindings: {
                            '80/tcp': [{
                                'HostPort': '80'
                            }]
                        }
                    }
                },
                linkId: 3,
                links: [1, 2]
            }]
        }, {
            name: 'PHP Nginx',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
            disabled: true,
            color: '#3f51b5',
            mainContainer: 4,
            containers: [{
                name: 'MySQL',
                version: 'N/A',
                doc: 'https://hub.docker.com/',
                official: true,
                image: 'mysql:latest',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                layer: 'database',
                linkId: 1,
                links: []
            }, {
                name: 'Redis',
                version: 'N/A',
                doc: 'https://hub.docker.com/',
                official: true,
                image: 'redis:3-alpine',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                layer: 'cache',
                linkId: 2,
                links: []
            }, {
                name: 'PHP',
                version: 'N/A',
                doc: 'https://hub.docker.com/',
                official: true,
                image: 'php:7-fpm-alpine',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                layer: 'lang',
                linkId: 3,
                links: [1]
            }, {
                name: 'Nginx',
                version: 'N/A',
                doc: 'https://hub.docker.com/',
                official: true,
                image: 'nginx:alpine',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                layer: 'server',
                linkId: 4,
                links: [3]
            }]
        }, {
            name: 'Python',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
            disabled: true,
            color: '#ffd444',
            mainContainer: 4,
            containers: [{
                name: 'Dummy',
                version: 'N/A',
                doc: 'https://hub.docker.com/',
                official: false,
                image: 'N/A',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                layer: 'N/A',
                linkId: 1,
                links: []
            }]
        }, {
            name: 'Ruby',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
            disabled: true,
            color: '#e53935',
            mainContainer: 4,
            containers: [{
                name: 'Dummy',
                version: 'N/A',
                doc: 'https://hub.docker.com/',
                official: false,
                image: 'N/A',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                layer: 'N/A',
                linkId: 1,
                links: []
            }]
        }, {
            name: 'Node.js',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
            disabled: true,
            color: '#90c53f',
            mainContainer: 4,
            containers: [{
                name: 'Dummy',
                version: 'N/A',
                doc: 'https://hub.docker.com/',
                official: false,
                image: 'N/A',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                layer: 'N/A',
                linkId: 1,
                links: []
            }]
        }, {
            name: 'ASP.NET',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
            disabled: true,
            color: '#5c2d91',
            mainContainer: 4,
            containers: [{
                name: 'Dummy',
                version: 'N/A',
                doc: 'https://hub.docker.com/',
                official: false,
                image: 'N/A',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                layer: 'N/A',
                linkId: 1,
                links: []
            }]
        }, {
            name: 'Java',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
            disabled: true,
            color: '#1a71b8',
            mainContainer: 4,
            containers: [{
                name: 'Dummy',
                version: 'N/A',
                doc: 'https://hub.docker.com/',
                official: false,
                image: 'N/A',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenan convallis.',
                layer: 'N/A',
                linkId: 1,
                links: []
            }]
        }],
        project: {
            id: uuid(),
            name: '',
            description: '',
            codePath: '',
            stack: {}
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
