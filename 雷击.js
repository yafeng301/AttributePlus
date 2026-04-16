var priority = 40
var combatPower = 5.0
var attributeName = "雷击几率"
var attributeType = "ATTACK" 
var placeholder = "ljjl"

var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    /* 注册韧性，使其能抵抗雷击触发 */
    Utils.registerOtherAttribute("韧性", 1.0, "resilience")
    return Attr
}

function runAttack(Attr, attacker, entity, handle){
    if (attacker == null || entity == null) return false;

    /* 第一步：获取雷击触发几率 */
    var triggerChance = Attr.getRandomValue(attacker, handle)
    if (triggerChance <= 0) return false;

    /* 获取对方韧性，计算最终实际触发几率 */
    var resilience = Attr.getRandomValue(entity, "韧性", handle)
    var finalChance = triggerChance - resilience

    /* 第二步：概率触发判定 */
    if (finalChance > 0 && Attr.chance(finalChance)) {
        
        /* 【深度懒加载】：触发成功后，获取攻击者的面板“攻击力” */
        var baseAtk = Attr.getRandomValue(attacker, "攻击力", handle);
        
        /* 核心逻辑：设定雷击附加伤害为当前面板攻击力的 50% (0.5 可自行修改) */
        var lightningDamage = baseAtk * 0.5;

        if (lightningDamage > 0) {
            /* 将雷击伤害直接作为额外伤害加入到本次攻击中 */
            Attr.addDamage(attacker, lightningDamage, handle);

            /* 【视觉特效】：在受击者的位置生成一道纯视觉的闪电特效，不产生火焰和原版爆炸 */
            entity.getWorld().strikeLightningEffect(entity.getLocation());

            /* 【战斗反馈】：保留 0 位小数，仅对玩家发信 */
            var displayDmg = lightningDamage.toFixed(0);
            if (attacker.getType() == EntityType.PLAYER) {
                attacker.sendMessage("§7[§c战斗§7] §b你触发了一次§e§l雷击§b，附加了 §c" + displayDmg + " §b点雷击伤害！");
            }
            if (entity.getType() == EntityType.PLAYER) {
                entity.sendMessage("§7[§c战斗§7] §b你受到了一次§e§l雷击§b，额外承受了 §c" + displayDmg + " §b点伤害！");
            }
        }
    }
    return false
}