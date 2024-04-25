<br />
<div align="center">
  <a href="https://github.com/filiprak/tuya-led">
    <img src="assets/icons/on.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Tuya Led</h3>
  <p align="center">
    Taskbar LED Light controller.
  </p>
</div>

## About The Project

Tuya Led is a nifty little tool crafted for controlling your LED light strips straight from your Windows taskbar. It's like having a magic wand for your lights! With Tuya LED, you can tweak colors and switch the lights on and off in a snap, all from the comfort of your desktop. It's open-source, so feel free to dive in, tweak things, and make it even better!

### Installation

1. Clone the repo:

   ```sh
   git clone https://github.com/github_username/repo_name.git
   ```

2. Install NPM packages:

   ```sh
   npm install
   ```

3. Create `.env.json` file in the project root and put your credentials in it:

   ```json
   {
      "TUYA_CLIENT_ID": "<your-tuya-client-id>",
      "TUYA_SECRET_KEY": "<your-tuya-secret-key>",
      "TUYA_DEVICE_ID": "<your-tuya-device-id>"
   }
   ```

3. Build application:

   ```sh
   npm run make
   ```

4. Run application executable: `out/tuya-led-win32-x64/tuya-led.exe`, new icon should appear in taskbar.
