var priority = 50
var combatPower = 0.0
var attributeName = "混乱几率"
var attributeType = "ATTACK"
var placeholder = "hljl"

var PotionEffect = Packages.org.bukkit.potion.PotionEffect
var PotionEffectType = Packages.org.bukkit.potion.PotionEffectType
var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    Utils.registerOtherAttribute("韧性", 1.0, "resilience")
    return Attr
}

function runAttack(Attr, attacker, entity, handle){
    if (attacker == null || entity == null) return false;

    var value = Attr.getRandomValue(attacker, handle)
    if (value <= 0) return false;

    var value1 = Attr.getRandomValue(entity, "韧性", handle)
    var realChance = value - value1

    if(realChance > 0 && Attr.chance(realChance)){
        
        if (attacker.getType() == EntityType.PLAYER) {
            attacker.sendMessage("§7[§c战斗§7] §b你触发了一次§e§l混乱效果")
        }
        if (entity.getType() == EntityType.PLAYER) {
            entity.sendMessage("§7[§c战斗§7] §b你受到了一次§e§l混乱效果")
        }
        
        // 200 tick = 10秒, 等级0 = 反胃/混乱 I
        entity.addPotionEffect(new PotionEffect(PotionEffectType.CONFUSION, 200, 0))
    }
    return false
}