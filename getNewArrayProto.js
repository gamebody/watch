export const getNewArrayProto = function(callback) {
    const that = this
    const arrayProto = Array.prototype
    const newArrProto = []

    const originalMethods = ['push', 'pop', 'shift',  'unshift', 'splice', 'sort',  'reverse']

    originalMethods.forEach((method) => {
        const m = method
        // 原生方法
        const originalMethod = arrayProto[m]

        newArrProto[m] = function() {
            // callback
            if (callback) {
                callback()
            }

            return originalMethod.apply(this, arguments)
        }

    })

    return newArrProto
}