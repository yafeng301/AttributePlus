var priority = 50
var combatPower = 0.0
var attributeName = "麻痹几率"
var attributeType = "ATTACK"
var placeholder = "mbjl"

var PotionEffect = Packages.org.bukkit.potion.PotionEffect
var PotionEffectType = Packages.org.bukkit.potion.PotionEffectType
var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    Utils.registerOtherAttribute("韧性", 1.0, "resilience")
    return Attr
}

function runAttack(Attr, attacker, entity, handle) {
    if (attacker == null || entity == null) return false;

    /* 设定：仅当受击方是玩家时才生效（PVP专属控制） */
    if(entity.getType() != EntityType.PLAYER) return false;

    var value = Attr.getRandomValue(attacker, handle)
    if (value <= 0) return false;

    var value1 = Attr.getRandomValue(entity, "韧性", handle)
    var realChance = value - value1
    
    if(realChance > 0 && Attr.chance(realChance)){
        
        if (attacker.getType() == EntityType.PLAYER) {
            attacker.sendMessage("§7[§c战斗§7] §b你触发了一次麻痹,对方失去移动能力5秒")
        }
        // 因为前面已经限制了 entity 必须是 PLAYER，所以这里可以直接发消息
        entity.sendMessage("§7[§c战斗§7] §b你受到了一次麻痹,已经失去移动能力5秒")
        
        // 100 tick = 5秒, 等级7 = 极强力减速(无法移动)
        entity.addPotionEffect(new PotionEffect(PotionEffectType.SLOW, 100, 7))
    }

    return false
}