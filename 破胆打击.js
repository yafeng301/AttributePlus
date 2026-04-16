var priority = 300
var combatPower = 0.0
var attributeName = "破胆打击"
var attributeType = "ATTACK"
var placeholder = "pddj"

var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    return Attr
}

function runAttack(Attr, attacker, entity, handle) {
    if(entity.getType() != EntityType.PLAYER){
        return false
    }
    var data = Attr.getData(entity,handle)

	attacker.sendMessage("§7[§c战斗§7] §b你触发了一次§e§l破胆打击§b对方失去攻击力§e§l5§b秒")
	entity.sendMessage("§7[§c战斗§7] §b你受到了一次§e§l破胆打击§b已经失去攻击力§e§l5§b秒")
    AttributeAPI.addPersistentSourceAttribute(data,"破胆打击",Arrays.asList(
        "【PVP】攻击力: " + -100 + "(%)"
    ),5);

    return false
}