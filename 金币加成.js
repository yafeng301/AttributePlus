var priority = 99
var combatPower = 1.0 
var attributeName = "金币加成"
var attributeType = "OTHER"
var placeholder = "jbjc"

// 保持不变，主要作为 PlaceholderAPI 变量源供掉落插件读取
function onLoad(attr){
    attr.setSkipFilter(true)
    return attr
}