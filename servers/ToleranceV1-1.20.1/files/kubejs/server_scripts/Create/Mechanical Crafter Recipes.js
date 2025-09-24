ServerEvents.recipes(MC => {
	MC.remove({ output: 'create_sa:andesite_exoskeleton_chestplate'})
	MC.recipes.create.mechanical_crafting(Item.of('create_sa:andesite_exoskeleton_chestplate', 1), [
		"ABCBA",
		"AADAA",
		"FEAEF"
	], {
		A: 'create:andesite_alloy',
		B: 'create:shaft',
		C: 'create:belt_connector',
		D: 'create_sa:heat_engine',
		E: 'c:ingots/zinc',
		F: 'c:stones',
	})
})