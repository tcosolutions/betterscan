import { render }  from 'react-dom';

class Subject {

    constructor(){
        this.observers = []
    }

    subscribe(callback) {
        this.observers.push(callback)
    }

    unsubscribe(callback) {
        var new_observers = []
        for (var i in this.observers)
        {
           if (this.observers[i] !== callback)
               new_observers.push(this.observers[i])
        }
        this.observers = new_observers
    }

    notify(property,data) {
        var new_observers = []
        this.observers.forEach(function (cb) {
            cb(this,property,data)
            new_observers.push(cb)
            }.bind(this)
        )
        this.observers = new_observers
    }
}

export default Subject
