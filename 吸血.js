var priority = 20
var combatPower = 0.0
var attributeName = "生命吸取" // 即吸血几率
var attributeType = "ATTACK"
var placeholder = "smxq"

var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    Utils.registerOtherAttribute("吸血倍率", 0.0, "xxbl")
    Utils.registerOtherAttribute("吸血抵抗", 0.0, "xxdk") // 独立判定：有几率直接打断吸血触发
    Utils.registerOtherAttribute("吸血抗性", 0.0, "xxkx") // 削弱判定：削减吸血恢复量的倍率
    Utils.registerOtherAttribute("吸血躲避", 0.0, "xxdb") // 削减判定：削减吸血触发的几率
    return Attr
}

/**
 * 核心执行方法：当实体发起攻击造成伤害时触发
 * @param Attr 属性API对象
 * @param attacker 攻击者实体 (触发吸血的一方)
 * @param entity 受击者实体 (被吸取的一方)
 * @param handle 伤害事件句柄
 */
function runAttack(Attr, attacker, entity, handle) {
    /* 【安全判定】确保攻守双方存在 */
    if (attacker == null || entity == null) return false;

    /* 第一步：获取【生命吸取】(吸血几率)，若为0直接跳出 */
    var smxq = Attr.getRandomValue(attacker, handle) 
    if (smxq <= 0) return false;

    /* 第二步：【独立打断判定】获取受击方的"吸血抵抗" */
    var resistChance = Attr.getRandomValue(entity, "吸血抵抗", handle)
    
    /* 如果抵抗触发成功，直接没收吸血权利，结束本次脚本 */
    if (resistChance > 0 && Attr.chance(resistChance)) {
        if (attacker.getType() == EntityType.PLAYER) {
            attacker.sendMessage("§7[§c战斗§7] §b你的吸血效果遭到了对方的一次抵抗");
        }
        if (entity.getType() == EntityType.PLAYER) {
            entity.sendMessage("§7[§c战斗§7] §b你触发了一次吸血抵抗效果");
        }
        return false;
    }

    /* 第三步：获取受击方的【吸血躲避】，计算实际触发几率 */
    var dodgeChance = Attr.getRandomValue(entity, "吸血躲避", handle)
    var finalChance = smxq - dodgeChance

    /* 第四步：如果最终几率达标，且成功触发吸血 */
    if (finalChance > 0 && Attr.chance(finalChance)) {
        
        /* 【深度懒加载】确认触发后，再获取吸血倍率和吸血抗性 */
        var xxbl = Attr.getRandomValue(attacker, "吸血倍率", handle)
        var xxkx = Attr.getRandomValue(entity, "吸血抗性", handle)

        /* 计算吸血治疗系数：按照原逻辑，基础自带 100% 伤害的吸血量，倍率扣除抗性后再除以 100 作为额外系数 */
        var healRatio = Math.max(xxbl - xxkx, 0) / 100 + 1
        
        /* 获取本次攻击造成的伤害 */
        var baseDamage = Attr.getDamage(attacker, handle)
        
        /* 计算最终治疗量：造成的伤害 * 治疗系数 */
        var healAmount = baseDamage * healRatio 
        
        if (healAmount > 0) {
            /* 调用 AttributePlus 内置的安全治疗方法，防止治疗溢出引发报错 */
            Utils.safeHeal(attacker, healAmount)
            
            /* 【战斗反馈】仅对玩家发送提示，截断小数 */
            if (attacker.getType() == EntityType.PLAYER) {
                attacker.sendMessage("§7[§c战斗§7] §b嗜血!§e§l吸血," + healAmount.toFixed(0) + "点生命值")
            }
        }
    }
    
    return false
}