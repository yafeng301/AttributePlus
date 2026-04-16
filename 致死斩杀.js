var priority = 300
var combatPower = 0.0
var attributeName = "致死斩杀"
var attributeType = "ATTACK"
var placeholder = "zszs"

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
        var health =  entity.getHealth()
        var damage = 0.3*health
        if(health-damage<=0){
            entity.setHealth(0)
        }else entity.setHealth(health-damage)
		attacker.sendMessage("§7[§c战斗§7] §b你触发了一次§e§l致死斩杀§b对方失去血量§e§l"+damage.toFixed(0)+"")
	    entity.sendMessage("§7[§c战斗§7] §b你受到了一次§e§l致死斩杀§b失去血量为§e§l"+damage.toFixed(0)+"")	
       
    }
				
    return false
}