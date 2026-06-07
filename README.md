# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



Future Implementation - 

The car's OBD port provides physical access point (conenct with OBD - 2 Adapter), and CAN bus is the network protocol that carries the data from vechicles various sensors.


You can absoultely use a Arduino board/RasberryPi with a CAN bus shield to interface directly with the CAN bus, or you can use a laptop connected via adapter. This gives you a great foundation for your data - logging script.


To transalte RAW binary data to JSON, your application needs to understand the protocol, such as ELM327 commands, that the OBD-II adapter uses. The app parses the bytes according to the specific standard codes for things like engine temperature or speed and then formats those values into key-value pairs to create the JSON object.

Using Python is a great choice for this! You can use the obd library, which simplifies communication with ELM327-compatible adapters.

In your code, you'd first initialize a connection, then query for specific sensor values, like engine temperature or vehicle speed. The library returns these values as unit-bearing objects that you can convert to readable numbers.

After that, you just pack those readings into a Python dictionary and use the built-in json module to serialize it into a JSON string.

To develop that an Interface - use a cross-platform framework like React Native or Flutter, which allows you to write the code once and deploy it to both stores (Andriod and IOS).

As, soon as car bluetooth is connected, API is triggered and all values are set to cloud to access that values everywhere from the mobile device.

When using Wi-Fi, the OBD-II adapter itself acts as a small, local network device. It creates its own Wi-Fi network, just like your home router, but without internet access. You connect your smartphone or laptop to that specific Wi-Fi network, and then the adapter streams the sensor data directly to your device over that connection.

The cellular connection on your phone handles the final leg of the journey, pushing the data up to your cloud server. This ensures that your dashboard or mobile app is updated, allowing anyone with the right permissions to access those real-time vehicle logs from anywhere.