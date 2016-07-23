import Vue from 'vue';
import Shell from 'shelljs';
import Project from '../scripts/dist/entities/project';
import Docker from '../scripts/dist/utils/docker';
import Snackbar from '../scripts/dist/utils/snackbar';
import View from '../scripts/dist/utils/view';

// Vue app
const vue = new Vue({
    el: '#app',
    data: {
        command: {
            current: '',
            buffer: {
                items: [],
                size: 5,
                index: 0
            }
        },
        project: {}
    },
    attached() {
        // Load project data
        this.project = new Project().find(View.parameters().projectId);
    },
    methods: {
        sendCommand() {
            // Current command
            const command = this.command.current;

            // Launch command
            const child = Shell.exec(command, {
                async: true,
                silent: true
            });

            // Get command stdout
            child.stdout.on('data', (data) => {

                // Get elements
                const terminalOutputElement = document.querySelector('#terminal-output');
                const terminalContainerElement = document.querySelector('#terminal-container');

                // Set output
                terminalOutputElement.innerHTML += `> ${command}\n${data}`;

                // Scroll down
                terminalContainerElement.scrollTop = terminalContainerElement.scrollHeight;
            });

            // Handle buffer
            this.command.buffer.index = 0;

            if (this.command.buffer.items.length < this.command.buffer.size) {
                this.command.buffer.items.push(this.command.current);
            } else {
                this.command.buffer.items.shift();
                this.command.buffer.items.push(this.command.current);
            }

            this.command.current = '';
        },
        bufferUp() {
            if (this.command.buffer.index + 1 <= this.command.buffer.items.length) {
                this.command.buffer.index++;
                this.command.current = this.command.buffer.items[this.command.buffer.items.length - this.command.buffer.index];
            }
        },
        bufferDown() {
            if (this.command.buffer.index - 1 > 0) {
                this.command.buffer.index--;
                this.command.current = this.command.buffer.items[this.command.buffer.items.length - this.command.buffer.index];
            }
        },
        runInfrastructure() {
            Snackbar.show('Deploying infrastructure');

            const docker = new Docker();

            docker.createStack(this.project, {
                onFinished: (container) => {
                    Snackbar.show(`Container ready [${container.Name.substring(1)}]`);

                    // TODO: store container ID
                    //this.project.update();

                    console.info(container);
                    console.info(`Container ID: ${container.Id}`);
                    console.info(`Container IP: ${container.NetworkSettings.IPAddress}`);
                },
                onError: (err) => {
                    Snackbar.show('Error: Try pulling the containers first');
                    console.error(err);
                }
            });
        },
        getInfrastructure() {
            Snackbar.show('Pulling docker containers');

            const docker = new Docker();

            docker.pullStack(this.project.stack);

            // TODO: extract callbacks
            /*docker.pull('nginx:alpine', {
                onProgress: (event) => {
                    console.log(`Status: ${event.status}`);

                    if (typeof event.progress !== "undefined") {
                        console.log(`Progress: ${event.progress}`);
                    }
                    console.log('--------------------------');
                },
                onFinished: () => {
                    Snackbar.show('Containers ready');
                },
                onError: (err) => {
                    Snackbar.show('Error: Check the container name/tag');
                    console.error(err);
                }
            });*/
        }
    }
});
