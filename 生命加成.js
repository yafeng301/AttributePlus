var priority = 100
var combatPower = 0.0
var attributeName = "生命加成"
var attributeType = "UPDATE"
var placeholder = "smjc"

function onLoad(Attr){
    Attr.setSkipFilter(true)
    return Attr
}

function run(Attr, entity, handle){
    var SX = Attr.getRandomValue(entity, handle)
    var data = Attr.getData(entity, handle)
    
    AttributeAPI.takeSourceAttribute(data, attributeName)
    
    if (SX > 0) {
        /* 补充了冒号，并加上 false */
        AttributeAPI.addSourceAttribute(data, attributeName, Arrays.asList("生命上限: " + SX + "(%)"), false)
    }
    return false
}