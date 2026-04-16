var priority = 9999
var combatPower = 5.0
var attributeName = "暗影打击"
var attributeType = "ATTACK" 
var placeholder = "aydj"

var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    return Attr
}

function runAttack(Attr, attacker, entity, handle) {
    if(entity.getType() != EntityType.PLAYER){
        return false
    }

    var value=  Attr.getRandomValue(attacker, handle)
    var CF = Attr.chance(value)
    if(CF){
        var damage =  entity.getMaxHealth()*0.1
        for(var i =1;i<11;i++){
        AttributeAPI.runEntityTask(i*1500, "暗影打击"+i, entity, false, function(){
            entity.damage(damage)
            attacker.sendMessage("§7[§c战斗§7] §b你触发了一次§e§l暗影打击")
	        entity.sendMessage("§7[§c战斗§7] §b你受到了§e§l暗影打击§b伤害§e§l"+damage.toFixed(0)+"")
        })
    }
}

    return false
}