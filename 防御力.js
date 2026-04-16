var priority = 10
var combatPower = 0.0
var attributeName = "防御力"
var attributeType = "DEFENSE"
var placeholder = "fyl"

var EntityType = Packages.org.bukkit.entity.EntityType

function onLoad(Attr) {
    Attr.setSkipFilter(false)
    Utils.registerOtherAttribute("【PVP】防御力", 0.0, "pvpfyl")
    Utils.registerOtherAttribute("【PVE】防御力", 0.0, "pvefyl")
    return Attr
}

/**
 * 核心执行方法：当实体受到攻击并计算防御时触发
 * 注意：DEFENSE 类型的参数顺序与 ATTACK 相反，受击者(entity) 在前
 */
function runDefense(Attr, entity, attacker, handle) {
    /* 【安全判定】确保攻守双方都真实存在 */
    if (entity == null || attacker == null) return false;

    /* 【基础防御获取】仅提取受击者面板上的"防御力"作为基础计算值 */
    var totalDefense = Attr.getRandomValue(entity, handle);

    /* 【身份识别】判定攻守双方是否为玩家 */
    var isEntityPlayer = (entity.getType() == EntityType.PLAYER);
    var isAttackerPlayer = (attacker.getType() == EntityType.PLAYER);

    /* 【场景防御懒加载】根据作战环境(PVP/PVE)调取专属防御力 */
    if (isEntityPlayer && isAttackerPlayer) {
        totalDefense += Attr.getRandomValue(entity, "【PVP】防御力", handle);
    } else if (isEntityPlayer || isAttackerPlayer) {
        totalDefense += Attr.getRandomValue(entity, "【PVE】防御力", handle);
    }

    /* 【核心机制：破防判定】 */
    if (totalDefense > 0) {
        var armorBreak = Attr.getRandomValue(attacker, "破防攻击", handle);
        
        if (armorBreak >= totalDefense) {
            /* 完全破防 */
            totalDefense = 0.0;
            if (attacker.getType() == EntityType.PLAYER) {
                 attacker.sendMessage("§7[§c战斗§7] §e你的攻击完全贯穿了对方的护甲！");
            }
        } else {
            /* 常规破防计算 */
            totalDefense = Math.max(0.0, totalDefense - armorBreak);
        }
    }

    /* 【实装免伤】精准调用带 Entity 参数的方法 */
    if (totalDefense > 0) {
        if (typeof handle.getDamage === "function") {
            // 传入 entity 获取当前伤害
            var currentDamage = handle.getDamage(entity);
            // 扣除防御力，保证伤害不为负数
            var finalDamage = Math.max(0.0, currentDamage - totalDefense);
            // 传入 entity 和最终伤害进行重新赋值
            handle.setDamage(entity, finalDamage);
        } else if ("damage" in handle) {
            // 备用方案：直接操作 damage 变量
            handle.damage = Math.max(0.0, handle.damage - totalDefense);
        }
    }
    
    return false;
}