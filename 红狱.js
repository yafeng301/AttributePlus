/* 优先级设定为极高(999)，确保在攻击力(10)、暴击(30)等所有伤害结算完毕后，作为最终倍率放大总伤害 */
var priority = 999
var combatPower = 20.0
/* 脚本主属性名，读取最终伤害加成 */
var attributeName = "最终伤害加成" 
var attributeType = "ATTACK"
var placeholder = "zzshjc"

var EntityType = Packages.org.bukkit.entity.EntityType
/* 引入线程安全的哈希表，用于在服务器内存中临时储存怪物身上的【红狱 Debuff】及过期时间 */
var ConcurrentHashMap = Packages.java.util.concurrent.ConcurrentHashMap
var prisonMemory = new ConcurrentHashMap()

function onLoad(Attr) {
    Attr.setSkipFilter(false) 
    
    /* 注册相关的子属性 */
    Utils.registerOtherAttribute("最终受伤加深", 0.0, "zzssjs")
    Utils.registerOtherAttribute("红狱几率", 0.0, "hyjl")
    Utils.registerOtherAttribute("红狱效果", 0.0, "hyxg")
    Utils.registerOtherAttribute("红狱持续", 0.0, "hycx") // 单位：秒
    
    return Attr
}

function runAttack(Attr, attacker, entity, handle) {
    /* 安全判定，防止报错 */
    if (attacker == null || entity == null) return false;

    var entityId = entity.getUniqueId().toString();
    var now = Packages.java.lang.System.currentTimeMillis();

    /* =========================================
       [机制 1]：触发并施加【红狱】Debuff
    ========================================= */
    var prisonChance = Attr.getRandomValue(attacker, "红狱几率", handle);
    
    // 如果拥有红狱几率，且概率触发成功
    if (prisonChance > 0 && Attr.chance(prisonChance)) {
        var prisonEffect = Attr.getRandomValue(attacker, "红狱效果", handle);
        var prisonDuration = Attr.getRandomValue(attacker, "红狱持续", handle);

        // 确保效果和持续时间有效
        if (prisonEffect > 0 && prisonDuration > 0) {
            // 计算过期时间：当前毫秒时间戳 + (持续秒数 * 1000)
            var expireTime = now + (prisonDuration * 1000);
            
            // 将 Debuff 数据写入内存池，覆盖该实体旧的红狱状态（刷新持续时间）
            prisonMemory.put(entityId, { effect: prisonEffect, expireTime: expireTime });

            // 战斗反馈飘字
            if (attacker.getType() == EntityType.PLAYER) {
                attacker.sendMessage("§7[§6系统§7] §c你将目标拖入了红狱！受到的最终伤害大幅加深！");
            }
            if (entity.getType() == EntityType.PLAYER) {
                entity.sendMessage("§7[§6系统§7] §c你被拖入了红狱！受到的最终伤害大幅加深！");
            }
            
            // 可选视觉特效：目标脚下生成火焰粒子或闪电
            // entity.getWorld().strikeLightningEffect(entity.getLocation());
        }
    }

    /* =========================================
       [机制 2]：读取双方的最终乘区面板
    ========================================= */
    var finalDmgBonus = Attr.getRandomValue(attacker, handle); // 攻击者的最终伤害加成
    var vulnBonus = Attr.getRandomValue(entity, "最终受伤加深", handle); // 受击者的基础最终受伤加深

    /* =========================================
       [机制 3]：结算【红狱】Debuff 对受伤加深的影响
    ========================================= */
    var debuffData = prisonMemory.get(entityId);
    if (debuffData != null) {
        if (now <= debuffData.expireTime) {
            // 如果 Debuff 还在有效期内，将红狱效果（%）直接叠加到目标的受伤加深属性上
            vulnBonus += debuffData.effect;
        } else {
            // 如果 Debuff 已经过期，从内存中将其清理掉，防止内存泄漏
            prisonMemory.remove(entityId);
        }
    }

    /* =========================================
       [机制 4]：最终伤害结算 (独立乘区相乘)
    ========================================= */
    // 如果双方都没有最终乘区加成，也没有红狱效果，直接终止计算节约性能
    if (finalDmgBonus <= 0 && vulnBonus <= 0) return false;

    // 获取当前已被前面各种脚本（基础、暴击等）累加完毕的总伤害
    var baseDamage = Attr.getDamage(attacker, handle);
    if (baseDamage <= 0) return false;

    /* 【硬核公式核心】：独立乘区算法。
      总伤害 = 基础池总伤害 * (1 + 最终伤害加成%) * (1 + 最终受伤加深%)
      这样做能确保“加伤”和“易伤”是互相乘算的，收益极高。
    */
    var multiplierDmg = 1 + (finalDmgBonus * 0.01);
    var multiplierVuln = 1 + (vulnBonus * 0.01);
    
    var finalDamage = baseDamage * multiplierDmg * multiplierVuln;
    
    /* 算出经过最终倍率放大后，多出了多少额外伤害 */
    var extraDamage = finalDamage - baseDamage;

    if (extraDamage > 0) {
        // 将额外的乘区伤害注入底层伤害池
        Attr.addDamage(attacker, extraDamage, handle);
    }

    return false;
}