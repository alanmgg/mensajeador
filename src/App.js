import React, { useState, useEffect, useRef } from 'react';
import Stomp from 'stompjs';

function App() {
  const [message, setMessage] = useState('')
  const [userid, setUserId] = useState('USID')
  const [subscriptionObject, setSubscrition] = useState('USID')
  const [client, setClient] = useState(null);
  const [recMessage, fillRecMessage] = useState([]);
  
  const bottomRef = useRef();

  let stompClient;
  
  useEffect(() => {
    if (!client) {
      console.log('Connecting to queue ...');
      queueConnect();
    }

    scrollToBottom();
  }, [client]);

  useEffect(() => {
    scrollToBottom();
    console.log("scrolling");
  }, [recMessage]);

  useEffect(() => {
    console.log("scrolling de regreso");
  }, []);

  function queueConnect() {
    var ws = new WebSocket('ws://192.168.56.102:15674/ws');

    const headers = {
      'login': 'admin',
      'passcode': 'admin',
      'durable': 'true',
      'auto-delete': 'false',
      // 'type':'fanout'
    };

    stompClient = Stomp.over(ws);
    
    stompClient.connect(headers, successConnection, failedConnection);

    setClient(stompClient);
  }

  function successConnection(frame) {
    var userIdTemp = (Math.floor(Math.random() * 1000 + 1));
    setUserId(userid + userIdTemp);
    console.log('Success connection for user Id:' + userid);
    // const subscriptionQ = stompClient.subscribe('/queue/myQueue', receivedMessage)
    const subscriptionX = stompClient.subscribe('/exchange/myExchange', receivedMessage, {id: userIdTemp});
    setSubscrition(subscriptionX);
    console.log("+++", subscriptionX.id);
  }

  function failedConnection(frame) {
    console.log('Failed connection ...');
  }

  function receivedMessage(message) {
    // console.log(message);
    // console.log(message.body);
    fillRecMessage(oldArray => [...oldArray, message.headers.senderId + ": " + message.body]);
  }

  function sendMessage() {
    console.log("Send message clicked ...", message);
    if(client && message.trim() !== '') {
      // client.send("/queue/myQueue", {}, message);
      client.send("/exchange/myExchange", {senderId: userid}, message);
      console.log('Message sent ...');
      setMessage('');
    }
  }

  function changeUserID() {
    console.log("Changing id from ", subscriptionObject);
    fillRecMessage([]);
    if (subscriptionObject) {
      subscriptionObject.unsubscribe();
      const subscriptionX = client.subscribe('/exchange/myExchange', receivedMessage, {id: userid})
      setSubscrition(subscriptionX);
      console.log("+++", subscriptionX.id);
    }
  }

  function registraInput(e, valor) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }

  const scrollToBottom = () => {
    bottomRef.current.scrollIntoView({
    behavior: "smooth",
    block: "start",
    });
  };

  return (    
    <section className="msger">
      <div className="input-group fluid">
        <label className="msg-info-name" htmlFor="userId">UserId</label>
        <input type="text" id="userId" className="msger-input" placeholder="user id" onChange={(event) => setUserId(event.target.value)} />
        <button className="msger-send-btn" onClick={() => { changeUserID() }}>Subscribe</button>
      </div>
      <header className="msger-header">
        <div className="msger-header-title">
        <i className="fas fa-comment-alt"></i> AbricotChat
        </div>
        <div className="msger-header-options">
          <span><i class="fas fa-cog"></i></span>
        </div>
      </header>

      <main className="msger-chat" style={{height: '300px', overflowY: 'scroll'}}>
        
        {recMessage.map((item, idx) => {
          var regex = /(^[^:]+): /g;
          var item_user_id = "";
          var item_msg = item.replace(regex,"");
          var matches, arr_group = [];
          while (matches = regex.exec(item)) {
            arr_group.push(matches[1]);
          }
          if (arr_group.length > 0) 
            item_user_id = arr_group[0];
          
          var it_is_me = (userid == item_user_id);

          if (!it_is_me) {
            return (
              <div key={idx} className="msg left-msg">
                <div className="msg-bubble">
                  <div className="msg-info">
                    <div className="msg-info-name">{item_user_id}</div>
                    <div className="msg-info-time">12:45</div>
                  </div>

                  <div className="msg-text">
                    {item_msg}
                  </div>
                </div>
              </div>
            )
          } else {
            return (
              <div key={idx} className="msg right-msg">
                <div className="msg-bubble">
                  <div className="msg-info">
                    <div className="msg-info-name">Me</div>
                    <div className="msg-info-time">12:46</div>
                  </div>

                  <div className="msg-text">
                    {item_msg}
                  </div>
                </div>
              </div>
            )
          }
        })}
        <div ref={bottomRef} className="list-bottom"></div>
      </main>

      <div className="msger-inputarea">
        <input type="text" className="msger-input" id="messageInput" placeholder="Enter your message..." onKeyDown={(event) => registraInput(event)} onChange={(event) => setMessage(event.target.value)} value={message} />
        <button className="msger-send-btn" onClick={() => { sendMessage() }} >Send</button>
      </div>
    </section>
  );
}

export default App;