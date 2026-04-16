var priority = 2000
var combatPower = 0.0
var attributeName = "反伤几率"
/* 设定为受击时触发 */
var attributeType = "DEFENSE"
var placeholder = "fsjl"

/* 导入实体类型包，用于后续判断实体身份防止发信报错 */
var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    Attr.setSkipFilter(false)
    /* 注册相关的子属性 */
    Utils.registerOtherAttribute("反伤倍率", 0.0, "fsbl")
    Utils.registerOtherAttribute("反伤抵抗", 0.0, "fsdk") // 削减倍率
    Utils.registerOtherAttribute("反伤躲避", 0.0, "fsdb") // 削减几率
    return Attr
}

/**
 * 核心执行方法：当实体受到攻击时触发
 * @param Attr 属性API对象
 * @param entity 受击者实体 (拥有反伤属性的一方)
 * @param attacker 攻击者实体 (承受反伤的一方，原代码命名为killer，这里规范化)
 * @param handle 伤害事件句柄
 */
function runDefense(Attr, entity, attacker, handle) {
    /* 【安全判定】确保攻守双方存在 */
    if (entity == null || attacker == null) return false;

    /* 第一步：获取受击者的基础【反伤几率】。如果没有几率，直接终止后续所有计算，极大节省性能 */
    var reflectChance = Attr.getRandomValue(entity, handle)
    if (reflectChance <= 0) return false;

    /* 第二步：获取攻击者的【反伤躲避】，并计算最终触发几率 */
    var dodgeChance = Attr.getRandomValue(attacker, "反伤躲避", handle)
    var finalChance = reflectChance - dodgeChance

    /* 第三步：判断最终几率是否大于0，并且通过概率判定是否成功触发 */
    if (finalChance > 0 && Attr.chance(finalChance)) {
        
        /* 【深度懒加载】：只有在确定触发了反伤后，
           我们才去向服务器请求倍率、抵抗值和本回合的总伤害。
        */
        
        /* 获取受击方的【反伤倍率】和攻击方的【反伤抵抗】 */
        var reflectRate = Attr.getRandomValue(entity, "反伤倍率", handle)
        var resistRate = Attr.getRandomValue(attacker, "反伤抵抗", handle)
        
        /* 计算最终的生效倍率 (使用 Math.max 防止被抵抗成负数导致给攻击者加血) */
        var finalRate = Math.max(0, reflectRate - resistRate)

        /* 如果经过抵抗削减后，依然有反伤倍率 */
        if (finalRate > 0) {
            /* 获取攻击者本次造成的真实伤害 */
            var incomingDamage = Attr.getDamage(attacker, handle)
            
            /* 计算反伤的具体数值 (受到的伤害 * 最终倍率百分比) */
            var reflectDamage = incomingDamage * finalRate * 0.01

            /* 如果计算出的反伤数值大于 0，则执行反伤惩罚 */
            if (reflectDamage > 0) {
                /* 调用 Bukkit 原生方法直接对攻击者造成真实伤害 */
                attacker.damage(reflectDamage)

                /* 【体验优化】：使用 toFixed(1) 将浮点数截断保留1位小数
                   防止聊天框出现 "伤害为 15.33333333" 这样难看的小数 
                */
                var displayDamage = reflectDamage.toFixed(1)

                /* 【战斗反馈】仅当对应实体是玩家时才发送文字提示，防止给怪物发消息导致控制台报错 */
                if (entity.getType() == EntityType.PLAYER) {
                    entity.sendMessage("§7[§c战斗§7] §b你触发了一次§e§l反伤攻击§b,伤害为 §c" + displayDamage)
                }
                if (attacker.getType() == EntityType.PLAYER) {
                    attacker.sendMessage("§7[§c战斗§7] §b你受到了一次§e§l反伤攻击§b,伤害为 §c" + displayDamage)
                }
            }
        }
    }
    
    return false
}