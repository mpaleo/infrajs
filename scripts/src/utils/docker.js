import Array from 'lodash/array';
import Collection from 'lodash/collection';
import Snackbar from './snackbar';
import DockerRemoteAPI from 'dockerode';

export default class {

    constructor() {
        this.dockerRemoteAPI = new DockerRemoteAPI({
            socketPath: '/var/run/docker.sock'
        });
    }

    /**
     * Create containers
     * @param containersToCreate
     * @param callback
     */
    create(containersToCreate, callback) {
        if (containersToCreate.length > 0) {
            var containerToCreate = Array.head(containersToCreate);

            this.dockerRemoteAPI.createContainer(containerToCreate.rapi, (err, container) => {
                if (err) {
                    callback.onError(err);
                } else {
                    container.start((err, data) => {
                        if (err) {
                            callback.onError(err);
                        } else {
                            container.inspect((err, data) => {
                                if (err) {
                                    callback.onError(err);
                                } else {
                                    callback.onFinished(data);

                                    // Replace links
                                    for (var i = 0; i < containersToCreate.length; i++) {
                                        if (containersToCreate[i].rapi.hasOwnProperty('HostConfig') && containersToCreate[i].rapi.HostConfig.hasOwnProperty('Links')) {
                                            for (var x = 0; x < containersToCreate[i].rapi.HostConfig.Links.length; x++) {
                                                containersToCreate[i].rapi.HostConfig.Links[x] =
                                                    containersToCreate[i].rapi.HostConfig.Links[x].replace('{{' + containerToCreate.linkId + '}}', data.Name.substring(1));
                                            }
                                        }
                                    }

                                    containersToCreate.splice(0, 1);

                                    this.create(containersToCreate, callback);
                                }
                            });
                        }
                    });
                }
            });
        }
    }

    /**
     * Resolve container dependencies
     * @param container
     * @param resolved
     * @param unresolved
     * @param stack
     * @returns {*}
     */
    resolveDependencies(container, resolved, unresolved, stack) {
        unresolved.push(container);

        container.links.forEach((link) => {
            if (Array.findIndex(resolved, ['linkId', link]) == -1) {
                if (Array.findIndex(unresolved, ['linkId', link]) >= 0) {
                    throw 'Circular reference detected on: ' + container.name;
                }
                else {
                    this.resolveDependencies(Collection.find(stack.containers, ['linkId', link]), resolved, unresolved, stack);
                }
            }
        });

        resolved.push(container);

        unresolved = Array.pull(unresolved, container);

        return resolved;
    }

    /**
     * Download containers
     * @param stack
     */
    pullStack(stack) {
        try {
            var resolvedContainers = this.resolveDependencies(Collection.find(stack.containers, ['linkId', stack.mainContainer]), [], [], stack);

            resolvedContainers.concat(Array.difference(stack.containers, resolvedContainers)).forEach((container) => {
                this.pull(container.image, {
                    onProgress: (event) => {
                        console.log(`Status: ${event.status} [${container.name}]`);

                        if (typeof event.progress !== 'undefined') {
                            console.log(`Progress: ${event.progress} [${container.name}]`);
                        }
                        console.log('--------------------------');
                    },
                    onFinished: () => {
                        Snackbar.show(`Container ready [${container.name}]`);
                    },
                    onError: (err) => {
                        Snackbar.show(`Error: Check the container settings [${container.name}]`);
                        console.error(err);
                    }
                });
            });
        }
        catch (exception) {
            console.error(exception);
        }
    }

    /**
     * Create container stack
     * @param project
     * @param callback
     */
    createStack(project, callback) {
        var resolvedContainers = this.resolveDependencies(Collection.find(project.stack.containers, ['linkId', project.stack.mainContainer]), [], [], project.stack);

        // Replace code path
        for (var i = 0; i < resolvedContainers.length; i++) {
            if (resolvedContainers[i].rapi.hasOwnProperty('HostConfig') && resolvedContainers[i].rapi.HostConfig.hasOwnProperty('Binds')) {
                for (var x = 0; x < resolvedContainers[i].rapi.HostConfig.Binds.length; x++) {
                    resolvedContainers[i].rapi.HostConfig.Binds[x] =
                        resolvedContainers[i].rapi.HostConfig.Binds[x].replace(new RegExp('{{CODE_PATH}}', 'g'), project.codePath);
                }
            }
        }

        this.create(resolvedContainers, callback);

        /*
         TODO: create containers without dependencies
         Array.difference(project.stack.containers, resolvedContainers).forEach(function (dep) {
            console.info(dep.name);
         });
         */
    }

    /**
     * Pull docker image
     * @param image
     * @param callback
     */
    pull(image, callback) {
        this.dockerRemoteAPI.pull(image, (err, stream) => {
            this.dockerRemoteAPI.modem.followProgress(stream, (err, output) => {
                if (err) {
                    callback.onError(err);
                } else {
                    callback.onFinished();
                }
            }, (event) => {
                callback.onProgress(event);
            });
        });
    }
}
