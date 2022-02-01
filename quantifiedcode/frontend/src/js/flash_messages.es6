import { render }  from 'react-dom';
import Utils from 'utils'
import Subject from 'subject'

class FlashMessages extends Subject {

    constructor(){
        super()
        this.currentMessages = {}
        this.messageStream = []
        this.messageCount = 0
    }

    postMessage(data){
        var messageId = this.messageCount
        this.messageCount++
        var messageData = {
            id: messageId,
            data: data,
            receivedAt: new Date(),
        }
        if (messageData.duration === undefined)
            messageData.duration = 2500
        this.currentMessages[messageId] = messageData
        this.messageStream.push(messageId)
        this.notify("newMessage",messageData)
        return messageId
    }
}

var instance

function getInstance()
{
    if (instance === undefined)
        instance = new FlashMessages()
    return instance
}

export default {getInstance:getInstance}
