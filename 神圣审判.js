var priority = 300
var combatPower = 0.0
var attributeName = "神圣审判"
var attributeType = "ATTACK"
var placeholder = "sssp"

function onLoad(Attr) {
    Attr.setSkipFilter(false)
    Utils.registerOtherAttribute("审判层数", 0.0, "spcs")
    return Attr
}

function runAttack(Attr, attacker, entity, handle) {
    var JL = Attr.getRandomValue(attacker, handle)
    var Adata = Attr.getData(attacker ,handle)
    var iC = false
    if(Attr.chance(JL)){
        var CS = Attr.getRandomValue(entity, "审判层数", handle)
        if(CS<3){
            CS += 1
            AttributeAPI.addSourceAttribute(Adata, "审判层数", Arrays.asList("审判层数"+CS))
            AttributeAPI.runEntityTask(15000, "审判层数清除", entity, false, function() {
                AttributeAPI.takeSourceAttribute(Adata, "审判层数")
            })
        }else{
            iC = true
            var D = Attr.getDamage(attacker, handle)*3
            CustomHud.sendCritPacket(entity.getEntityId(), D.toFixed(0), iC)
            Attr.addDamage(attacker, D, handle)
            AttributeAPI.takeSourceAttribute(Adata, "审判层数")
        }
    }
    return false
}
