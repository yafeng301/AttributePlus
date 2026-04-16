var priority = 40
var combatPower = 5.0
var attributeName = "燃烧几率"
var attributeType = "ATTACK" 
var placeholder = "rsjl"

var EntityType = Packages.org.bukkit.entity.EntityType
/* 导入 Bukkit 核心，用于调用底层定时任务器 */
var Bukkit = Packages.org.bukkit.Bukkit

function onLoad(Attr) {
    Utils.registerOtherAttribute("韧性", 1.0, "resilience")
    return Attr
}

function runAttack(Attr, attacker, entity, handle){
    if (attacker == null || entity == null) return false;

    /* 获取燃烧触发几率 */
    var triggerChance = Attr.getRandomValue(attacker, handle)
    if (triggerChance <= 0) return false;

    /* 韧性抵抗计算 */
    var resilience = Attr.getRandomValue(entity, "韧性", handle)
    var finalChance = triggerChance - resilience

    if (finalChance > 0 && Attr.chance(finalChance)) {
        
        /* 获取面板攻击力 */
        var baseAtk = Attr.getRandomValue(attacker, "攻击力", handle);
        
        /* 核心逻辑：设定每秒燃烧伤害为面板攻击力的 20% (0.2 可自行修改) */
        var burnDmgPerSec = baseAtk * 0.2;

        if (burnDmgPerSec > 0) {
            
            /* 【视觉特效】：让受击者身上燃起真实的火焰效果，持续 5 秒 (100 ticks = 5秒) */
            entity.setFireTicks(100);

            /* 【战斗反馈】 */
            if (attacker.getType() == EntityType.PLAYER) {
                attacker.sendMessage("§7[§c战斗§7] §b你点燃了对方，每秒将造成 §c" + burnDmgPerSec.toFixed(0) + " §b点燃烧伤害！");
            }
            if (entity.getType() == EntityType.PLAYER) {
                entity.sendMessage("§7[§c战斗§7] §b你被点燃了，正在承受持续的真实燃烧伤害！");
            }

            /* 【进阶机制：多线程异步扣血】 */
            var apPlugin = Bukkit.getPluginManager().getPlugin("AttributePlus");
            var secondsLeft = 5; // 设定燃烧持续时间：5 秒
            
            // 使用对象包裹任务ID，防止在匿名函数中出现作用域闭包报错
            var taskInfo = { id: -1 }; 
            
            // 启动定时任务：延迟 20 ticks (1秒) 后开始，每 20 ticks (1秒) 执行一次
            taskInfo.id = Bukkit.getScheduler().scheduleSyncRepeatingTask(apPlugin, function() {
                
                // 【安全拦截】：如果燃烧次数已到、或者实体已经死亡/掉线消失，立刻注销定时任务释放性能
                if (secondsLeft <= 0 || entity.isDead() || !entity.isValid()) {
                    Bukkit.getScheduler().cancelTask(taskInfo.id);
                    return;
                }
                
                // 执行真实扣血
                entity.damage(burnDmgPerSec);
                
                // 扣除剩余秒数
                secondsLeft--;
                
            }, 20, 20); 
        }
    }
    return false
}