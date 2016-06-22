import electron from 'electron';

const {app} = electron;
const {BrowserWindow} = electron;
let win;

function createWindow() {
    win = new BrowserWindow({icon: `${__dirname}/images/icon.png`});

    win.maximize();

    win.loadURL(`file://${__dirname}/../../views/projects.html`);

    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
