# net-promise
Simple net.Socket promise wrapper.

## Installation
```
npm install --save net-promise
```

## Usage

### Basic Usage
The default message handler processes string messages and waits for a message ending with the character ```\n``` to fulfil the promise.
```javascript
const { Socket, SocketError, SocketErrorType } = require("net-promise");

const ping = async() => {

  let socket;
  try {

    socket = await Socket({ host: 'localhost', port: 3000 });

    await socket.write("ping");

    const message = await socket.recv();
    console.log(message); //pong

  } catch (e) {

    if (e instanceof SocketError) {
      /*
        CONNECTION_REFUSED
        TRANSMISSION_ERROR
        CONNECTION_CLOSED
        TIMEOUT
      */
      console.log(e.type)
    }

  } finally {
    if (socket) socket.close();
  }

}
```
### Idle Timeout
```javascript
const { Socket, SocketError, SocketErrorType } = require("net-promise");

const ping = async() => {

  let socket;
  try {

    socket = await Socket({ host: 'localhost', port: 3000, timeout: 5 });
    
    await socket.recv();
    
  } catch (e) {

    if (e instanceof SocketError) {
      console.log(e.type) // TIMEOUT
    }

  } finally {
    if (socket) socket.close();
  }

}
```
### Custom Message Handler
```javascript
const { Socket, SocketError, SocketErrorType } = require("net-promise");

const ping = async() => {

  const myOwnMessageHandler = resolve => {
    const messages = [];
    let count = 0;
    return data => {
      count++;
      console.log("count", count);
      messages.push(data.toString());
      if (count === 10)
        resolve(messages.join(""));
    }
  }

  let socket;
  try {

    socket = await Socket({ host: 'localhost', port: 3000 }, myOwnMessageHandler);
    
    const message = await socket.recv();
    console.log(message);
    
  } catch (e) {

    if (e instanceof SocketError) {
      console.log(e.type)
    }

  } finally {
    if (socket) socket.close();
  }

}
```

## License

This service is licensed under the [MIT License](./LICENSE.txt).

All files located in the node_modules and external directories are externally maintained libraries used by this software which have their own licenses; we recommend you read them, as their terms may differ from the terms in the MIT License.
