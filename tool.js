export const pickUnusual = (longArr, shortArr) => {
    return longArr.filter((lv) => {
        for(const sv of shortArr) {
            if (sv === lv) {
                return false
            }
        }
        return true
    })
}