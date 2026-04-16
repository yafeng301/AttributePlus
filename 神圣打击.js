var priority = 300
var combatPower = 0.0
var attributeName = "神圣打击"
var attributeType = "ATTACK"
var placeholder = "ssdj"

var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    return Attr
}

function runAttack(Attr, attacker, entity, handle) {
    if(entity.getType() != EntityType.PLAYER){
        return false
    }
    var value=  Attr.getRandomValue(attacker, handle)
    var value1=  Attr.getRandomValue(attacker, "生命吸取", handle)/100

    var CF = Attr.chance(value)
    if(CF){
        var health =  entity.getHealth()
        var damage = value1*health
        if(health-damage<=0){
            entity.setHealth(0)
        }else entity.setHealth(health-damage)
		attacker.sendMessage("§7[§c战斗§7] §b你触发了一次§e§l神圣打击§b伤害为§e§l"+(damage*10).toFixed(0)+"")
	    entity.sendMessage("§7[§c战斗§7] §b你受到了一次§e§l神圣打击§b伤害为§e§l"+(damage*10).toFixed(0)+"")	
        

    }
    return false
}