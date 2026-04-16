var priority = 100
var combatPower = 0.0
var attributeName = "伤害加成"
var attributeType = "UPDATE"
var placeholder = "shjc"

function onLoad(Attr){
    Attr.setSkipFilter(true)
    return Attr
}

function run(Attr, entity, handle){
    var data = Attr.getData(entity, handle)
    var value = Attr.getRandomValue(entity, handle)
    
    /* 【致命错误修复】必须在最开始无条件清除旧属性！防止玩家频繁切换装备导致属性无限叠加 */
    AttributeAPI.takeSourceAttribute(data, "伤害加成属性")
    
    if (value > 0) {
        /* 补全了标准的冒号格式，以及末尾缺失的 false 布尔值 */
        AttributeAPI.addSourceAttribute(data, "伤害加成属性", Arrays.asList(
            "攻击力: " + value + "(%)",
            "【PVP】攻击力: " + value + "(%)",
            "【PVE】攻击力: " + value + "(%)"
        ), false)
    }
    return false
}