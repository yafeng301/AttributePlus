/* 严格按照要求设置优先级为 70 */
var priority = 70
var combatPower = 15.0
/* 主属性名：决定护盾的基础上限 */
var attributeName = "护盾属性"
var attributeType = "DEFENSE"
var placeholder = "hdsx"

var EntityType = Packages.org.bukkit.entity.EntityType
/* 引入 Java 线程安全的哈希表，用于在内存中持久化存储所有玩家的【当前护盾值】和【脱战时间】 */
var ConcurrentHashMap = Packages.java.util.concurrent.ConcurrentHashMap
var shieldMemory = new ConcurrentHashMap()

function onLoad(Attr) {
    Attr.setSkipFilter(false)
    /* 注册相关的子属性机制，强制在 attribute.yml 中生成配置节点 */
    Utils.registerOtherAttribute("生命护盾", 0.0, "smhd")
    Utils.registerOtherAttribute("护盾基础恢复", 0.0, "hdjchf")
    Utils.registerOtherAttribute("基础恢复加成", 0.0, "jchfjc")
    Utils.registerOtherAttribute("破盾效率", 0.0, "pdxl")
    return Attr
}

function runDefense(Attr, entity, attacker, handle) {
    if (entity == null || attacker == null) return false;

    /* 获取实体唯一ID，用于在内存池中读写护盾数据 */
    var entityId = entity.getUniqueId().toString();

    /* =========================================
       [机制 1 & 2 & 3]: 计算【护盾上限】
       公式：护盾上限 = 护盾量 + (最大生命值 * 生命护盾 * 0.01)
    ========================================= */
    var flatShield = Attr.getRandomValue(entity, handle);
    var hpShieldPercent = Attr.getRandomValue(entity, "生命护盾", handle);
    var maxHp = entity.getMaxHealth(); // 获取实体最大生命值
    
    var maxShield = flatShield + (maxHp * hpShieldPercent * 0.01);

    /* 如果该实体没有任何护盾上限，直接清除其内存记录并跳出 */
    if (maxShield <= 0) {
        shieldMemory.remove(entityId);
        return false;
    }

    /* 初始化或获取玩家当前的护盾内存数据 */
    var now = Packages.java.lang.System.currentTimeMillis();
    var shieldData = shieldMemory.get(entityId);
    if (shieldData == null) {
        // 数据结构：{ 当前护盾值, 上次受击时间, 上次结算恢复时间 }
        shieldData = { current: maxShield, lastHitTime: 0, lastRegenTime: now };
    }

    /* =========================================
       [机制 4 & 5]: 时间差懒加载计算【护盾恢复】
       原理：不使用定时任务(防卡顿)，而在每次挨打的瞬间，
       回头计算距离上次脱战经过了多少秒，一口气将应恢复的护盾补发。
    ========================================= */
    var regenBase = Attr.getRandomValue(entity, "护盾基础恢复", handle);
    if (regenBase > 0) {
        var regenAmp = Attr.getRandomValue(entity, "基础恢复加成", handle);
        var combatDelay = 5000; // 设定脱战判定时间：5000毫秒 (5秒)，可按需修改
        
        var timeSinceLastHit = now - shieldData.lastHitTime;
        
        // 只有当距离上次挨打超过 5 秒 (即脱战后)，才允许计算恢复
        if (timeSinceLastHit >= combatDelay) {
            // 计算有效恢复时长 (当前时间 - (上次恢复时间 与 脱战临界点 之间的最大值))
            var timeToRegen = now - Math.max(shieldData.lastRegenTime, shieldData.lastHitTime + combatDelay);
            
            if (timeToRegen > 0) {
                var secondsToRegen = timeToRegen / 1000.0;
                // 恢复公式：上限 * 基础恢复率% * (1 + 恢复加成%)
                var regenPerSec = maxShield * (regenBase * 0.01) * (1 + (regenAmp * 0.01));
                
                // 将期间积攒的护盾量补发给玩家，但不允许超过最大护盾上限
                shieldData.current = Math.min(maxShield, shieldData.current + (regenPerSec * secondsToRegen));
            }
        }
    }
    
    // 更新最后一次核算护盾恢复的时间戳
    shieldData.lastRegenTime = now;

    /* =========================================
       [机制 6 & 7]: 计算【破盾效率】与【最终伤害抵消】
    ========================================= */
    var incomingDamage = Attr.getDamage(attacker, handle);
    var breakEfficiency = Attr.getRandomValue(attacker, "破盾效率", handle);
    
    // 换算攻击者对护盾造成的有效伤害：基础伤害 * (1 + 破盾效率%)
    var effectiveDamageToShield = incomingDamage * (1 + (breakEfficiency * 0.01));
    var absorbedRawDamage = 0; // 记录最终抵消了多少【真身血量伤害】

    if (shieldData.current > 0) {
        if (shieldData.current >= effectiveDamageToShield) {
            // 情况A：护盾坚不可摧，完全挡下本次伤害
            shieldData.current -= effectiveDamageToShield;
            absorbedRawDamage = incomingDamage; 
        } else {
            // 情况B：护盾破裂！计算溢出伤害
            var leftoverShieldDamage = effectiveDamageToShield - shieldData.current;
            shieldData.current = 0;
            
            // 核心细节：溢出的护盾伤害，在打到真身血肉上时，必须褪去"破盾效率"的加成！
            var fleshDamage = leftoverShieldDamage / (1 + (breakEfficiency * 0.01));
            absorbedRawDamage = incomingDamage - fleshDamage;
        }
    }

    /* 结算免伤与更新数据 */
    if (absorbedRawDamage > 0) {
        // 调用底层接口，削减等量伤害
        Attr.takeDamage(attacker, absorbedRawDamage, handle);
        
        // 战斗反馈飘字 (仅对玩家发送，截断小数保留1位)
        if (entity.getType() == EntityType.PLAYER) {
            entity.sendMessage("§7[§6系统§7] §e吸收了 §c" + absorbedRawDamage.toFixed(1) + " §e点伤害！剩余护盾: §b" + shieldData.current.toFixed(1) + " / " + maxShield.toFixed(1));
        }
    }

    // 刷新该实体的挨打时间戳，重新进入战斗状态
    shieldData.lastHitTime = now;
    // 将更新后的护盾数据写回内存池
    shieldMemory.put(entityId, shieldData);

    return false;
}