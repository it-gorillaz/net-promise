'use strict';

const net = require("net"),
      sinon = require("sinon"),
      { expect } = require("chai"),
      { Socket, SocketError, SocketErrorType } = require("../");

describe("Socket", () => {
  
  let socket;    
  let netStub;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();    
    socket = new net.Socket();    
    netStub = sandbox.stub(net);
    netStub.createConnection.returns(socket);    
  })

  afterEach(() => {
    sandbox.restore();    
  })

  describe("#Socket()", () => {

    it("should throw SocketError on connection refused", async() => {
      
      const spy = sandbox.spy(socket, "once");
      setTimeout(() => socket.emit("error", new Error("Connection Refused")), 5);

      try {
        
        await Socket({ host: 'localhost', port: 25 });
        
      } catch (e) {        
        const [port, host] = netStub.createConnection.getCall(0).args;
        const [error] = spy.getCall(0).args;
        const [ready] = spy.getCall(1).args;
        expect(true).to.be.equals(netStub.createConnection.calledOnce);
        expect(true).to.be.equals(spy.calledTwice);
        expect('localhost').to.be.equals(host);
        expect(25).to.be.equals(port);
        expect("error").to.be.equals(error);
        expect("ready").to.be.equals(ready);
        expect(e).to.be.instanceOf(SocketError);
        expect(e.type).to.be.equals(SocketErrorType.CONNECTION_REFUSED);
      }

    })

    it("should connect to remote host", async() => {
      
      const spy = sandbox.spy(socket, "once");
      setTimeout(() => socket.emit("ready"), 5);

      try {
        
        const conn = await Socket({ host: 'localhost', port: 25 });
                
        const [port, host] = netStub.createConnection.getCall(0).args;
        const [error] = spy.getCall(0).args;
        const [ready] = spy.getCall(1).args;
        
        expect(conn).to.be.not.null;
        expect(true).to.be.equals(netStub.createConnection.calledOnce);
        expect(true).to.be.equals(spy.calledTwice);
        expect('localhost').to.be.equals(host);
        expect(25).to.be.equals(port);
        expect("error").to.be.equals(error);
        expect("ready").to.be.equals(ready);

      } catch (e) {        
        expect(true).to.be.equals(false);
      }

    })

  });

  describe("#write()", () => {

    it("should fail when sending message to remote host", async() => {

      const onceSpy = sandbox.spy(socket, "once");
      const writeSpy = sandbox.spy(socket, "write");
            
      setTimeout(() => socket.emit("ready"), 5);
      setTimeout(() => socket.emit("close", true), 10);

      try {
        
        const conn = await Socket({ host: 'localhost', port: 25 });
        await conn.write("test message");
                        
      } catch (e) {        
        const [port, host] = netStub.createConnection.getCall(0).args;
        const [error] = onceSpy.getCall(0).args;
        const [ready] = onceSpy.getCall(1).args;
        const [message] = writeSpy.getCall(0).args        

        expect(true).to.be.equals(writeSpy.calledOnce);
        expect(true).to.be.equals(netStub.createConnection.calledOnce);
        expect(true).to.be.equals(onceSpy.calledThrice);
        expect('localhost').to.be.equals(host);
        expect(25).to.be.equals(port);
        expect("error").to.be.equals(error);
        expect("ready").to.be.equals(ready);
        expect("test message").to.be.equals(message);
        expect(e).to.be.instanceOf(SocketError);
        expect(e.type).to.be.equals(SocketErrorType.TRANSMISSION_ERROR);
      }

    })

    it("should send message to remote host", async() => {

      const onceSpy = sandbox.spy(socket, "once");
      const writeStub = sandbox.stub(socket, "write");
                  
      writeStub.callsFake((message, cb) => cb(false));

      setTimeout(() => socket.emit("ready"), 5);      

      try {
        
        const conn = await Socket({ host: 'localhost', port: 25 });
        await conn.write("test message");
        
        const [port, host] = netStub.createConnection.getCall(0).args;
        const [error] = onceSpy.getCall(0).args;
        const [ready] = onceSpy.getCall(1).args;
        const [message] = writeStub.getCall(0).args        

        expect(true).to.be.equals(writeStub.calledOnce);
        expect(true).to.be.equals(netStub.createConnection.calledOnce);
        expect(true).to.be.equals(onceSpy.calledThrice);
        expect('localhost').to.be.equals(host);
        expect(25).to.be.equals(port);
        expect("error").to.be.equals(error);
        expect("ready").to.be.equals(ready);
        expect("test message").to.be.equals(message);
        
      } catch (e) {        
        expect(true).to.be.equals(false);
      }

    })

  })

  describe("#recv()", () => {

    it("should fail while awaiting message from remote host", async() => {

      const onceSpy = sandbox.spy(socket, "once");
      const onSpy = sandbox.spy(socket, "on");
                  
      setTimeout(() => socket.emit("ready"), 5);
      setTimeout(() => socket.emit("close", true), 10);

      try {
        
        const conn = await Socket({ host: 'localhost', port: 25 });
        await conn.recv();
                        
      } catch (e) {        
        const [port, host] = netStub.createConnection.getCall(0).args;
        const [error] = onceSpy.getCall(0).args;
        const [ready] = onceSpy.getCall(1).args;
        const [timeout] = onceSpy.getCall(2).args;
        const [close] = onceSpy.getCall(3).args;
        const [data] = onSpy.getCall(4).args;
                
        expect(true).to.be.equals(netStub.createConnection.calledOnce);
        
        expect('localhost').to.be.equals(host);
        expect(25).to.be.equals(port);
        expect("error").to.be.equals(error);
        expect("ready").to.be.equals(ready);
        expect("timeout").to.be.equals(timeout);
        expect("close").to.be.equals(close);        
        expect("data").to.be.equals(data);        
        expect(e).to.be.instanceOf(SocketError);
        expect(e.type).to.be.equals(SocketErrorType.TRANSMISSION_ERROR);
      }

    })

    it("should fail when remote host closes the connection", async() => {

      const onceSpy = sandbox.spy(socket, "once");
      const onSpy = sandbox.spy(socket, "on");
                  
      setTimeout(() => socket.emit("ready"), 5);
      setTimeout(() => socket.emit("close", false), 10);

      try {
        
        const conn = await Socket({ host: 'localhost', port: 25 });
        await conn.recv();
                        
      } catch (e) {        
        const [port, host] = netStub.createConnection.getCall(0).args;
        const [error] = onceSpy.getCall(0).args;
        const [ready] = onceSpy.getCall(1).args;
        const [timeout] = onceSpy.getCall(2).args;
        const [close] = onceSpy.getCall(3).args;
        const [data] = onSpy.getCall(4).args;
                
        expect(true).to.be.equals(netStub.createConnection.calledOnce);
        
        expect('localhost').to.be.equals(host);
        expect(25).to.be.equals(port);
        expect("error").to.be.equals(error);
        expect("ready").to.be.equals(ready);
        expect("timeout").to.be.equals(timeout);
        expect("close").to.be.equals(close);        
        expect("data").to.be.equals(data);        
        expect(e).to.be.instanceOf(SocketError);
        expect(e.type).to.be.equals(SocketErrorType.CONNECTION_CLOSED);
      }

    })

    it("should timeout while awaiting message from remote host", async() => {

      const onceSpy = sandbox.spy(socket, "once");
      const onSpy = sandbox.spy(socket, "on");
                  
      setTimeout(() => socket.emit("ready"), 5);
      setTimeout(() => socket.emit("timeout"), 10);

      try {
        
        const conn = await Socket({ host: 'localhost', port: 25 });
        await conn.recv();
                        
      } catch (e) {        
        const [port, host] = netStub.createConnection.getCall(0).args;
        const [error] = onceSpy.getCall(0).args;
        const [ready] = onceSpy.getCall(1).args;
        const [timeout] = onceSpy.getCall(2).args;
        const [close] = onceSpy.getCall(3).args;
        const [data] = onSpy.getCall(4).args;
                
        expect(true).to.be.equals(netStub.createConnection.calledOnce);
        
        expect('localhost').to.be.equals(host);
        expect(25).to.be.equals(port);
        expect("error").to.be.equals(error);
        expect("ready").to.be.equals(ready);
        expect("timeout").to.be.equals(timeout);
        expect("close").to.be.equals(close);        
        expect("data").to.be.equals(data);        
        expect(e).to.be.instanceOf(SocketError);
        expect(e.type).to.be.equals(SocketErrorType.TIMEOUT);
      }

    })

    it("should read message from remote host", async() => {

      const onceSpy = sandbox.spy(socket, "once");
      const onSpy = sandbox.spy(socket, "on");
                  
      setTimeout(() => socket.emit("ready"), 5);
      setTimeout(() => socket.emit("data", Buffer.from("test\n")), 10);

      try {
        
        const conn = await Socket({ host: 'localhost', port: 25 });
        const message = await conn.recv();
                        
        const [port, host] = netStub.createConnection.getCall(0).args;
        const [error] = onceSpy.getCall(0).args;
        const [ready] = onceSpy.getCall(1).args;
        const [timeout] = onceSpy.getCall(2).args;
        const [close] = onceSpy.getCall(3).args;
        const [data] = onSpy.getCall(4).args;
                
        expect(true).to.be.equals(netStub.createConnection.calledOnce);        
        expect('localhost').to.be.equals(host);
        expect(25).to.be.equals(port);
        expect("error").to.be.equals(error);
        expect("ready").to.be.equals(ready);
        expect("timeout").to.be.equals(timeout);
        expect("close").to.be.equals(close);        
        expect("data").to.be.equals(data);      
        expect("test\n").to.be.equals(message)  

      } catch (e) {            
        expect(true).to.be.equals(false);        
      }

    })

  })

  describe("#close()", () => {

    it("should close connection", async() => {

      const onceSpy = sandbox.spy(socket, "once");
      const destroySpy = sandbox.spy(socket, "destroy");
                  
      setTimeout(() => socket.emit("ready"), 5);
      
      try {
        
        const conn = await Socket({ host: 'localhost', port: 25 });
        conn.close();
                        
        const [port, host] = netStub.createConnection.getCall(0).args;
        const [error] = onceSpy.getCall(0).args;
        const [ready] = onceSpy.getCall(1).args;
                        
        expect(true).to.be.equals(netStub.createConnection.calledOnce);        
        expect(true).to.be.equals(destroySpy.calledOnce);
        expect('localhost').to.be.equals(host);
        expect(25).to.be.equals(port);
        expect("error").to.be.equals(error);
        expect("ready").to.be.equals(ready);
                
      } catch (e) {            
        expect(true).to.be.equals(false);        
      }

    })

  })

})