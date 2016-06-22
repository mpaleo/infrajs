import DockerRemoteAPI from 'dockerode';

export default class {

    constructor() {
        this.dockerRemoteAPI = new DockerRemoteAPI({
            socketPath: '/var/run/docker.sock'
        });
    }

    create(image, mountPath, callback) {
        this.dockerRemoteAPI.createContainer({
            'Image': image,
            'HostConfig': {
                'Binds': [`${mountPath}:/usr/share/nginx/html:ro`],
                'PortBindings': {
                    '80/tcp': [{
                        'HostPort': '80'
                    }]
                }
            }
        }, (err, container) => {
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
                            }
                        });
                    }
                });
            }
        });
    }

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
