class Settings {
    static values = {};

    static async loadSettings() {
        this.values.vel = await window.electronAPI.getStoreValue("settings.vel");
        this.values.accel = await window.electronAPI.getStoreValue("settings.accel");
        this.values.decel = await window.electronAPI.getStoreValue("settings.decel");
        this.values.tolerance = await window.electronAPI.getStoreValue("settings.tolerance");
        this.values.slowdown = await window.electronAPI.getStoreValue("settings.slowdown");

        if (this.values.vel == undefined) {
            await window.electronAPI.setStoreValue("settings.vel", 50);
        }
        if (this.values.accel == undefined) {
            await window.electronAPI.setStoreValue("settings.accel", 100);
        }
        if (this.values.decel == undefined) {
            await window.electronAPI.setStoreValue("settings.decel", 100);
        }
        if (this.values.tolerance == undefined) {
            await window.electronAPI.setStoreValue("settings.tolerance", 0.5);
        }
        if (this.values.slowdown == undefined) {
            await window.electronAPI.setStoreValue("settings.slowdown", 1);
        }

        document.getElementById("settings-vel").value = this.values.vel;
        document.getElementById("settings-accel").value = this.values.accel;
        document.getElementById("settings-decel").value = this.values.decel;
        document.getElementById("settings-tolerance").value = this.values.tolerance;
        document.getElementById("settings-slowdown").value = this.values.slowdown;
    }

    static async saveAndReloadSettings() {
        await window.electronAPI.setStoreValue("settings.vel", document.getElementById("settings-vel").value);
        await window.electronAPI.setStoreValue("settings.accel", document.getElementById("settings-accel").value);
        await window.electronAPI.setStoreValue("settings.decel", document.getElementById("settings-decel").value);
        await window.electronAPI.setStoreValue("settings.tolerance", document.getElementById("settings-tolerance").value);
        await window.electronAPI.setStoreValue("settings.slowdown", document.getElementById("settings-slowdown").value);

        this.loadSettings();
    }

    static getMaxVelocityDefault() {
        if (this.values.vel == null) {
            return 99;
        }
        return this.values.vel;
    }
    static getMaxAccelDefault() {
        if (this.values.accel == null) {
            return 99;
        }
        return this.values.accel;
    }
    static getMaxDecelDefault() {
        if (this.values.decel == null) {
            return 99;
        }
        return this.values.decel;
    }
    static getToleranceDefault() {
        if (this.values.tolerance == null) {
            return 99;
        }
        return this.values.tolerance;
    }
    static getSlowdownDefault() {
        if (this.values.slowdown == null) {
            return 99;
        }
        return this.values.slowdown;
    }
}

Settings.loadSettings();

document.getElementById("save-settings").onclick = () => {Settings.saveAndReloadSettings()};
