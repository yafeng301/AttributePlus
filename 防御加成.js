var priority = 100
var combatPower = 0.0
var attributeName = "防御加成"
var attributeType = "UPDATE"
var placeholder = "fyjc"

function onLoad(Attr){
    Attr.setSkipFilter(true)
    return Attr
}

function run(Attr, entity, handle){
    var data = Attr.getData(entity, handle)
    var value = Attr.getRandomValue(entity, handle)
    
    /* 同样修复无限叠加 Bug */
    AttributeAPI.takeSourceAttribute(data, "防御加成属性")
    
    if (value > 0) {
        AttributeAPI.addSourceAttribute(data, "防御加成属性", Arrays.asList(
            "防御力: " + value + "(%)",
            "【PVP】防御力: " + value + "(%)",
            "【PVE】防御力: " + value + "(%)"
        ), false)
    }
    return false
}