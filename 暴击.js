var priority = 30
var combatPower = 0.0
var attributeName = "暴击几率"
var attributeType = "ATTACK"
var placeholder = "bjjl"

/* 导入实体类型包，用于后续判断实体身份防止发信报错 */
var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    Attr.setSkipFilter(false)
    /* 注册相关的子属性 */
    Utils.registerOtherAttribute("暴击伤害", 0.0, "bjsh") // 增加暴击伤害倍率
    Utils.registerOtherAttribute("暴击躲避", 0.0, "bjdb") // 削减暴击触发几率
    Utils.registerOtherAttribute("暴伤抵抗", 0.0, "bsdk") // 削减暴击伤害倍率
    return Attr
}

/**
 * 核心执行方法：当实体发起攻击计算附加伤害时触发
 * @param Attr 属性API对象
 * @param attacker 攻击者实体 (拥有暴击属性的一方)
 * @param entity 受击者实体 (承受暴击的一方)
 * @param handle 伤害事件句柄
 */
function runAttack(Attr, attacker, entity, handle) {
    /* 【安全判定】确保攻守双方都真实存在 */
    if (attacker == null || entity == null) return false;

    /* 第一步：获取基础【暴击几率】。如果没有几率，直接终止后续所有计算，极大节省性能 */
    var critChance = Attr.getRandomValue(attacker, handle)
    if (critChance <= 0) return false;

    /* 第二步：获取受击方的【暴击躲避】，计算最终的暴击触发率 */
    var dodgeChance = Attr.getRandomValue(entity, "暴击躲避", handle)
    var finalChance = critChance - dodgeChance

    /* 第三步：如果扣除躲避后依然有几率，且概率触发成功 */
    if (finalChance > 0 && Attr.chance(finalChance)) {
        
        /* 【深度懒加载】：确认暴击触发后，才向服务器请求暴伤、抵抗和基础伤害数据 */
        var critDamage = Attr.getRandomValue(attacker, "暴击伤害", handle)
        var critResist = Attr.getRandomValue(entity, "暴伤抵抗", handle)

        /* 计算最终生效的暴伤倍率，使用 Math.max 防止被抵抗成负数 */
        var finalCritDamage = Math.max(0, critDamage - critResist)

        /* 如果经过抵抗削减后，依然有暴击伤害倍率 */
        if (finalCritDamage > 0) {
            /* 获取本次攻击的当前总伤害 */
            var baseDamage = Attr.getDamage(attacker, handle)
            
            /* 计算需要额外附加的暴击真实伤害 (基础伤害 * 最终倍率百分比) */
            var extraDamage = baseDamage * finalCritDamage * 0.01

            /* 将额外伤害加入伤害池 */
            Attr.addDamage(attacker, extraDamage, handle)

            /* 【战斗反馈】格式化浮点数，并判断只有玩家才发送文字提示 */
            var displayDamage = extraDamage.toFixed(0)
            if (attacker.getType() == EntityType.PLAYER) {
                attacker.sendMessage("§7[§c战斗§7] §b你触发了一次§e§l暴击§b伤害为§e§l" + displayDamage)
            }
            if (entity.getType() == EntityType.PLAYER) {
                entity.sendMessage("§7[§c战斗§7] §b你受到了一次§e§l暴击§b伤害为§e§l" + displayDamage)
            }
        }
    }
    
    return false
}