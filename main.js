// Modules to control application life and create native browser window
const {app, Tray, Menu, Notification} = require('electron');
const path = require('path');
const Store = require('electron-store');

let tray;
let notificationInterval;

// Allow only one instance of the app
const isFirstInstance = app.requestSingleInstanceLock();
if (!isFirstInstance) {
    app.quit();
}

app.whenReady().then(() => {
    app.dock.hide();

    firstRunCheck();
    initTrayMenu();

    const notificationIntervalTime = 1000 * 60 * 60; // One hour
    notificationInterval = setInterval(() => {
        sendNotification();
    }, notificationIntervalTime);
});


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});

app.on("quit", () => {
    clearInterval(notificationInterval);
});

const initTrayMenu = () => {
    tray = new Tray(path.join(__dirname, '/assets/icon.png'));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Open at startup",
            type: 'checkbox',
            checked: app.getLoginItemSettings().openAtLogin,
            click: toggleStartupRun
        },
        {
            label: 'Quit',
            click: () => app.quit()
        }
    ]);

    tray.setContextMenu(contextMenu);
};

const sendNotification = () => {
    if (!Notification.isSupported()) return;

    const waterAdvice = [
        'Mild dehydration caused by exercise or heat can have negative effects on both your physical and mental performance.',
        'Drinking more water may help with some health problems, such as constipation and kidney stones, but more studies are needed.',
        'Other beverages can contribute to fluid balance, including coffee and tea. Most foods also contain water.'
    ];

    const notification = new Notification({
        title: "Time to drink water!",
        body: waterAdvice[randomNumber(0, waterAdvice.length)],
    });

    notification.show();
};

const firstRunCheck = () => {
    const store = new Store();
    const runBefore = store.get('runBefore');
    if (!runBefore) {
        app.setLoginItemSettings({openAtLogin: true});
        store.set('runBefore', true);
    }
};

const toggleStartupRun = () => {
    const openAtLogin = !app.getLoginItemSettings().openAtLogin;
    app.setLoginItemSettings({openAtLogin});
};

const randomNumber = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
