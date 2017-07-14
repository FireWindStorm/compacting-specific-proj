var exampleKey = "stat.size";
var exampleValue = "%0A%0A %0A%0A%0A%20 %20%20%20%20%20This%20is_a%20test%20of%20converting~special%20characters%20to%20none%20~~___End      %0A%0A %0A%0A%0A%20 %20%20%20%20%20";

var exampleData = 'https://kimb.github.io/pathfinder-web-sheet/?stat.size=1&stat.STR.base=10&stat.STR.enhance=1&stat.STR.misc=1&stat.STR.temp=1&stat.DEX.base=10&stat.DEX.enhance=1&stat.DEX.misc=1&stat.DEX.temp=1&stat.CON.base=10&stat.CON.enhance=1&stat.CON.misc=1&stat.CON.temp=1&stat.INT.base=10&stat.INT.enhance=1&stat.INT.misc=1&stat.INT.temp=1&stat.WIS.base=10&stat.WIS.enhance=1&stat.WIS.misc=1&stat.WIS.temp=1&stat.CHA.base=10&stat.CHA.enhance=1&stat.CHA.misc=1&stat.CHA.temp=1&load.light.base-speed=35&load.note=1&load.medium.base-speed=25&load.medium.max-dex=3&load.medium.skill-penalty=3&load.heavy.base-speed=25&load.heavy.skill-penalty=6&load.heavy.max-dex=1&load.stagger.max-dex=0&speed.armored=1&speed.swim=1&speed.climb=1&speed.fly=1&speed.fly-manu=1&speed.burrow=1&speed.misc=1&speed.temp=1&note.ability=1&note.save=1&note.attack=1&note.feat=1&note.character=1&note.special=1&note.equipment=1&note.rage=1&info.character=Zanar%2520Zikras+Zanir%2BTripol_Hug.Tong&info.player=1&info.race=1&info.gender=1&info.height=1&info.weight=1&info.hair=1&info.eyes=1&info.skin=1&info.age=1&info.alignment=1&info.deity=1&info.homeland%20and%20occupation=1&info.languages=1&info.dr=1&info.sr=1&info.resists=1&md.prevChangeTime=2017-07-13+18%3A41%3A55&md.rev=783&class1.class=1&class1.hd=1&class1.hp=1&class1.skill=1&class1.bab=1&class1.fort=1&class1.refl=1&class1.will=1&class1.levels=1&class2.class=1&class2.hd=1&class2.hp=1&class2.skill=1&class2.bab=1&class2.fort=1&class2.refl=1&class2.will=1&class2.levels=1&init.enh=1&init.misc=1&init.temp=1&hp.temp=1&hp.subdual=1&hp.lethal=1&skill.acrobatics.is-class=true&skill.acrobatics.ranks=1&skill.acrobatics.temp=1&skill.acrobatics.misc=1&skill.appraise.is-class=true&skill.appraise.ranks=1&skill.appraise.misc=1&skill.appraise.temp=1&skill.bluff.is-class=true&skill.bluff.ranks=1&skill.bluff.temp=1&skill.bluff.misc=1&skill.climb.is-class=true&skill.climb.ranks=1&skill.climb.temp=1&skill.climb.misc=1&skill.craft0.is-class=true&skill.craft0.categ=1&skill.craft0.ranks=1&skill.craft0.misc=1&skill.craft0.temp=1&skill.craft1.is-class=true&skill.craft1.categ=1&skill.craft1.ranks=1&skill.craft1.misc=1&skill.craft1.temp=1&skill.diplomacy.is-class=true&skill.diplomacy.ranks=1&skill.diplomacy.misc=1&skill.diplomacy.temp=1&skill.disable%20device.is-class=true&skill.disable%20device.ranks=1&skill.disable%20device.temp=1&skill.disable%20device.misc=1&skill.disguise.is-class=true&skill.disguise.ranks=1&skill.disguise.misc=1&skill.disguise.temp=1&skill.escape%20artist.is-class=true&skill.escape%20artist.ranks=1&skill.escape%20artist.temp=1&skill.escape%20artist.misc=1&skill.fly.is-class=true&skill.fly.ranks=1&skill.fly.misc=1&skill.fly.temp=1&skill.handle%20animal.is-class=true&skill.handle%20animal.ranks=1&skill.handle%20animal.temp=1&skill.handle%20animal.misc=1&skill.heal.is-class=true&skill.heal.ranks=1&skill.heal.temp=1&skill.heal.misc=1&skill.intimidate.is-class=true&skill.intimidate.ranks=1&skill.intimidate.temp=1&skill.intimidate.misc=1&skill.kn0.is-class=true&skill.kn0.categ=1&skill.kn0.ranks=1&skill.kn0.misc=1&skill.kn0.temp=1&skill.kn1.is-class=true&skill.kn1.categ=1&skill.kn1.ranks=1&skill.kn1.misc=1&skill.kn1.temp=1&skill.linguistics.is-class=true&skill.linguistics.ranks=1&skill.linguistics.misc=1&skill.linguistics.temp=1&skill.perception.is-class=true&skill.perception.ranks=1&skill.perception.misc=1&skill.perception.temp=1&skill.perf0.is-class=true&skill.perf0.categ=1&skill.perf0.ranks=1&skill.perf0.misc=1&skill.perf0.temp=1&skill.perf1.categ=1&skill.perf1.is-class=true&skill.perf1.ranks=1&skill.perf1.misc=1&skill.perf1.temp=1&skill.prof0.is-class=true&skill.prof0.categ=1&skill.prof0.ranks=1&skill.prof0.misc=1&skill.prof0.temp=1&skill.prof1.is-class=true&skill.prof1.categ=1&skill.prof1.ranks=1&skill.prof1.misc=1&skill.prof1.temp=1&skill.ride.is-class=true&skill.ride.ranks=1&skill.ride.misc=1&skill.ride.temp=1&skill.sense%20motive.is-class=true&skill.sense%20motive.ranks=1&skill.sense%20motive.misc=1&skill.sense%20motive.temp=1&skill.sleight%20of%20hand.is-class=true&skill.sleight%20of%20hand.ranks=1&skill.sleight%20of%20hand.misc=1&skill.sleight%20of%20hand.temp=1&skill.spellcraft.is-class=true&skill.spellcraft.ranks=1&skill.spellcraft.misc=1&skill.spellcraft.temp=1&skill.stealth.is-class=true&skill.stealth.ranks=1&skill.stealth.misc=1&skill.stealth.temp=1&skill.survival.is-class=true&skill.survival.ranks=1&skill.survival.misc=1&skill.survival.temp=1&skill.swim.is-class=true&skill.swim.ranks=1&skill.swim.misc=1&skill.swim.temp=1&skill.use%20magic%20device.is-class=true&skill.use%20magic%20device.ranks=1&skill.use%20magic%20device.misc=1&skill.use%20magic%20device.temp=1&skill.custom0.is-class=true&skill.custom0.categ=1&skill.custom0.ability=STR&skill.custom0.ranks=1&skill.custom0.misc=1&skill.custom0.temp=1&skill.custom1.is-class=true&skill.custom1.categ=1&skill.custom1.ability=DEX&skill.custom1.ranks=1&skill.custom1.misc=1&skill.custom1.temp=1&ac.dodge=1&ac.natural=1&ac.deflect=1&ac.ac-misc=1&ac.temp=1&ac.touch-misc=1&ac.ff-misc=1&fort.enhance=1&fort.misc=1&fort.temp=1&refl.enhance=1&refl.misc=1&refl.temp=1&will.enhance=1&will.misc=1&will.temp=1&melee.misc=1&melee.temp=1&ranged.misc=1&ranged.temp=1&cmb.misc=1&cmb.temp=1&cmd.misc=1&cmd.temp=1&armor.desc=1&armor.ac=1&armor.max-dex=1&armor.skill-penalty=1&armor.spell-fail=1&armor.weight=1&armor.type=Light&armor.medium.base-speed=25&armor.heavy.base-speed=25&shield.desc=1&shield.ac=1&shield.max-dex=1&shield.skill-penalty=1&shield.spell-fail=1&shield.weight=1&weapon0.desc=1&weapon0.bonus=1&weapon0.dmg=1&weapon0.crit=1&weapon0.range=1&weapon0.type=1&weapon0.weight=1&weapon0.note=1&weapon1.desc=1&weapon1.bonus=1&weapon1.dmg=1&weapon1.crit=1&weapon1.range=1&weapon1.type=1&weapon1.weight=1&weapon1.note=1&eq.0.name=1&eq.0.value=1&eq.0.weight=1&eq.1.name=1&eq.1.value=1&eq.1.weight=1&rage.enable=true&rage.level=1&rage.rounds.misc=1&rage.rounds.used=1&sp0.className=1&sp0.level=1&sp0.ability=INT&sp0.l0.0.dc=1&sp0.l0.0.save=1&sp0.l0.0.prep=1&sp0.l0.0.used=1&sp0.l0.0.name=1&sp0.l0.0.SR=true&sp0.l0.0.school=1&sp0.l0.0.duration=1&sp0.l0.0.range=personal&sp0.l0.1.range=personal&sp0.l0.1.save=1&sp0.l0.1.prep=1&sp0.l0.1.used=1&sp0.l0.1.name=1&sp0.l0.1.school=1&sp0.l0.1.duration=1&sp0.l0.1.SR=true&sp0.l0.class=1&sp0.l0.known=2&sp0.l0.dc=1&sp0.l0.misc=1&sp0.l0.used=1&sp0.l1.0.dc=1&sp0.l1.0.save=1&sp0.l1.0.prep=1&sp0.l1.0.used=1&sp0.l1.0.name=1&sp0.l1.0.SR=true&sp0.l1.0.school=1&sp0.l1.0.duration=1&sp0.l1.0.range=touch&sp0.l1.1.range=medium&sp0.l1.1.SR=true&sp0.l1.1.save=1&sp0.l1.1.prep=1&sp0.l1.1.used=1&sp0.l1.1.name=1&sp0.l1.1.school=1&sp0.l1.1.duration=1&sp0.l1.class=1&sp0.l1.dc=1&sp0.l1.known=2&sp0.l1.misc=1&sp0.l1.used=1&sp0.note=1&sp0.l2.0.SR=true&sp0.l2.0.dc=1&sp0.l2.0.save=1&sp0.l2.0.prep=1&sp0.l2.0.used=1&sp0.l2.0.name=1&sp0.l2.0.school=1&sp0.l2.0.duration=1&sp0.l2.0.range=close&sp0.l2.1.SR=true&sp0.l2.1.save=1&sp0.l2.1.prep=1&sp0.l2.1.used=1&sp0.l2.1.name=1&sp0.l2.1.school=1&sp0.l2.1.duration=1&sp0.l2.1.range=personal&sp0.l2.class=1&sp0.l2.known=2&sp0.l2.dc=1&sp0.l2.misc=1&sp0.l2.used=1&sp0.l3.0.SR=true&sp0.l3.0.save=1&sp0.l3.0.prep=1&sp0.l3.0.used=1&sp0.l3.0.name=1&sp0.l3.0.school=1&sp0.l3.0.duration=1&sp0.l3.0.range=touch&sp0.l3.1.SR=true&sp0.l3.1.save=1&sp0.l3.1.prep=1&sp0.l3.1.used=1&sp0.l3.1.name=1&sp0.l3.1.school=1&sp0.l3.1.duration=1&sp0.l3.1.range=close&sp0.l3.class=1&sp0.l3.known=2&sp0.l3.dc=1&sp0.l3.misc=1&sp0.l3.used=1&sp0.l4.0.save=1&sp0.l4.0.prep=1&sp0.l4.0.used=1&sp0.l4.0.name=1&sp0.l4.0.school=1&sp0.l4.0.duration=1&sp0.l4.0.range=medium&sp0.l4.1.save=1&sp0.l4.1.prep=1&sp0.l4.1.used=1&sp0.l4.1.name=1&sp0.l4.1.school=1&sp0.l4.1.duration=1&sp0.l4.1.range=long&sp0.l4.class=1&sp0.l4.known=2&sp0.l4.dc=1&sp0.l4.misc=1&sp0.l4.used=1&sp0.l5.0.save=1&sp0.l5.0.prep=1&sp0.l5.0.used=1&sp0.l5.0.name=1&sp0.l5.0.school=1&sp0.l5.0.duration=1&sp0.l5.0.range=personal&sp0.l5.1.save=1&sp0.l5.1.prep=1&sp0.l5.1.used=1&sp0.l5.1.name=1&sp0.l5.1.school=1&sp0.l5.1.duration=1&sp0.l5.1.range=touch&sp0.l5.class=1&sp0.l5.known=2&sp0.l5.dc=1&sp0.l5.misc=1&sp0.l5.used=1&sp0.l6.0.dc=1&sp0.l6.0.save=1&sp0.l6.0.prep=1&sp0.l6.0.used=1&sp0.l6.300.name=1&sp0.l6.0.school=1&sp0.l6.0.duration=1&sp0.l6.0.range=close&sp0.l6.class=1';