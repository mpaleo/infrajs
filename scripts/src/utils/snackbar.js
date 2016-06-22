export default class {
    static show(message, time = 2000) {
        document.querySelector('#snackbar-container').MaterialSnackbar.showSnackbar({
            message: message,
            timeout: 2000
        });
    }
}
