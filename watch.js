// @ts-check
import { pickUnusual } from './tool'
import { getNewArrayProto } from './getNewArrayProto'

class Watch {
    constructor(observerData) {
        this.data = observerData
        this.callback = null
        this.deep = 0
        this.setups()
    }

    setups() {
        this.observe(this.data, 0)
    }

    observe(obj, currentDeep = 1) {
        let cd = currentDeep
        const keys = Object.getOwnPropertyNames(obj)

        // deeep === 0 observer all
        if (cd > this.deep && this.deep !== 0) {
            return
        }
        
        for(const key of keys) {
            const type = typeof obj[key]
            const isArray = Array.isArray(obj[key])
            if (type === 'object' && !isArray) {
                this.observe(obj[key], ++cd)
            } else {
                this.observing(obj, key)
            }
        }
    }

    unObserve(obj, currentDeep = 1) {
        let cd = currentDeep
        const keys = Object.getOwnPropertyNames(obj)

        // deeep === 0 observer all
        if (cd > this.deep && this.deep !== 0) {
            return
        }

        for(const key of keys) {
            const type = typeof obj[key]
            const isArray = Array.isArray(obj[key])
            if (type === 'object' && !isArray) {
                this.unObserve(obj[key], ++cd)
            } else {
                this.unwatch(obj, key)
            }
        }      
    }

    observing(obj, key) {
        const that = this
        const k = key
        const o = obj
        let v = o[k]
        // 添加数组变异方法
        if (Array.isArray(o[k])) {
            const list = o[k]
            this._observeArray(list)
            return
        }

        Object.defineProperty(o, k, {
            get() {
                return v
            },
            set(newValue) {
                const oldV = v
                const newV = newValue
                const oldObj = Object.assign({}, {
                    ...o
                })
                v = newV
                
                // run callback                
                if (that.callback) {
                    // sleep
                    
                    if (that.sleepTime) {
                        setTimeout(() => {
                            that.callback(oldObj, o, k, oldV, newV)                            
                        }, that.sleepTime)
                    } else {
                        that.callback(oldObj, o, k, oldV, newV)
                    }
                }

            },
            configurable: true,
            enumerable: true,
        })
    }

    _observeArray(list) {
        list.__proto__ = getNewArrayProto(this.callback)
    }

    _unObserveArray(list) {
        list.__proto__ = Array.prototype
    }

    unwatch(obj, attr) {
        const o = obj
        const k = attr
        let v = o[k]

        // 取消数组变异方法
        if (Array.isArray(o[k])) {
            const list = o[k]
            this._unObserveArray(list)
            return
        }

        Object.defineProperty(o, k, {
            get() {
                return v
            },
            set(newValue) {
                v = newValue
            },
            configurable: true,
            enumerable: true,
        })
    }

    now(...args) {
        // 参数是(['a', 'b']) || ('a', 'b’)
        // 转换为数组
        const params = Array.isArray(args[0]) ? [...args[0]] : args

        params.forEach((attr) => {
            const oldValue = this.data[attr]
            this.data[attr] = oldValue
        })
    }

    fire(callback) {
        this.callback = callback

        // observer之前记录的属性
        this.unObserve(this.data, 0)
        if (!this.params) {
            this.observe(this.data)
            return this
        }
        this.params.forEach((attr) => {
            this.observing(this.data, attr)
        })
        return this
    }

    on(...args) {
        // 参数是(['a', 'b']) || ('a', 'b’)
        // 转换为数组
        const params = Array.isArray(args[0]) ? [...args[0]] : args

        // 先记录要observer的属性
        this.params = params
        return this
    }

    remove(...args) {
        const params = Array.isArray(args[0]) ? [...args[0]] : args
        this.params = pickUnusual(this.params, params)
        return this
    }

    sleep(timeMS = 0) {
        this.sleepTime = timeMS
        return this
    }

    level(l = 0) {
        this.deep = l
        return this
    }
}
