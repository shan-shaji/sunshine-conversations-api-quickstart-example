'use strict';

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const SunshineConversationsApi = require('sunshine-conversations-client');
const { name } = require('body-parser');
const dotEnv = require('dotenv');

// Config
const result = dotEnv.config({ path: './.env' });
if (result.error)
  throw result.error;

console.log(result.parsed);

let defaultClient = SunshineConversationsApi.ApiClient.instance;
let basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = process.env.APP_ID;
basicAuth.password = process.env.SECRET_KEY;
const PORT = 8000;

const apiInstance = new SunshineConversationsApi.MessagesApi()

// Server https://expressjs.com/en/guide/routing.html
const app = express();

app.use(bodyParser.json());

// Expose /messages endpoint to capture webhooks https://docs.smooch.io/rest/#operation/eventWebhooks
app.post('/messages', function(req, res) {
  console.log('webhook PAYLOAD:\n', JSON.stringify(req.body, null, 4));

  const appId = req.body.app.id;
  const trigger = req.body.events[0].type;

  // Call REST API to send message https://docs.smooch.io/rest/#operation/postMessage
  if (trigger === 'conversation:message') {
    const authorType = req.body.events[0].payload.message.author.type;
    if(authorType === 'user'){
      const conversationId = req.body.events[0].payload.conversation.id;
      let name = req.body.events[0].payload.message.author.displayName;
        sendMessage(appId, conversationId, name);
        res.end();
    }
  }
});

// Listen on port
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

async function sendMessage(appId, conversationId, name){
    let messagePost = new SunshineConversationsApi.MessagePost();  
    messagePost.setAuthor({type: 'business'});
  messagePost.setContent({ type: 'text', text: `Hey ${name}, how are you` });
  try {
    let response = await apiInstance.postMessage(appId, conversationId, messagePost);
    console.log('API RESPONSE:\n', response);
  } catch (error) {
    console.log(error);
  }
 
}
