var priority = 20
var combatPower = 5.0
var attributeName = "冰冻几率"
var attributeType = "ATTACK" 
var placeholder = "bdjl"

var PotionEffect = Packages.org.bukkit.potion.PotionEffect
var PotionEffectType = Packages.org.bukkit.potion.PotionEffectType
var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    /* 建议每个涉及韧性的脚本都注册一下，防止某个脚本缺失导致读取不到 */
    Utils.registerOtherAttribute("韧性", 1.0, "resilience")
    return Attr
}

function runAttack(Attr, attacker, entity, handle){
    if (attacker == null || entity == null) return false;

    /* 第一步：获取自身触发几率 */
    var value = Attr.getRandomValue(attacker, handle)
    
    /* 【核心优化】如果没有几率，直接跳过，节省大量性能 */
    if (value <= 0) return false;

    /* 获取对方韧性，并计算最终触发率 */
    var value1 = Attr.getRandomValue(entity, "韧性", handle)
    var realChance = value - value1

    /* 只有最终几率大于0，且触发成功时才执行 */
    if(realChance > 0 && Attr.chance(realChance)){
        
        /* 【核心优化】只有对象是玩家时，才发送文本提示。防止给怪物发消息报错 */
        if (attacker.getType() == EntityType.PLAYER) {
            attacker.sendMessage("§7[§c战斗§7] §b你触发了一次§e§l冰冻效果")
        }
        if (entity.getType() == EntityType.PLAYER) {
            entity.sendMessage("§7[§c战斗§7] §b你受到了一次§e§l冰冻效果")
        }
        
        // 200 tick = 10秒, 等级1 = 减速 II
        entity.addPotionEffect(new PotionEffect(PotionEffectType.SLOW, 200, 1))
    }
    return false
}