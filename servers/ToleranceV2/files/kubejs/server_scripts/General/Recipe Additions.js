ServerEvents.recipes(event => {
	// ✦ HIGHEST
	event.shapeless(
		Item.of('kubejs:tolecoin', 20), 
		[
			'apotheotic_additions:ascended_coin'
		]
	)

	// ✦ HIGH
	event.shapeless(
		Item.of('kubejs:tolecoin', 4), 
		[
			'companions:end_coin'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 4), 
		[
			'apotheotic_additions:infused_coin'
		]
	)

	// ✦ MEDIUM
	event.shapeless(
		Item.of('kubejs:tolecoin', 12), 
		[
			'createdeco:netherite_coinstack'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 3), 
		[
			'createdeco:netherite_coin'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 3), 
		[
			'apotheotic_additions:apotheotic_coin'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 3), 
		[
			'companions:nether_coin'
		]
	)

	// ✦ LOW
	event.shapeless(
		Item.of('kubejs:tolecoin', 8), 
		[
			'createdeco:iron_coinstack'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 8), 
		[
			'createdeco:industrial_iron_coinstack'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 8), 
		[
			'createdeco:brass_coinstack'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 8), 
		[
			'createdeco:gold_coinstack'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 2), 
		[
			'createdeco:iron_coin'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 2), 
		[
			'createdeco:industrial_iron_coin'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 2), 
		[
			'createdeco:brass_coin'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 2), 
		[
			'createdeco:gold_coin'
		]
	)

	// ✦ LOWEST
	event.shapeless(
		Item.of('kubejs:tolecoin', 4), 
		[
			'createdeco:zinc_coinstack'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 4), 
		[
			'createdeco:copper_coinstack'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 1), 
		[
			'createdeco:zinc_coin'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 1), 
		[
			'createdeco:copper_coin'
		]
	)
	event.shapeless(
		Item.of('kubejs:tolecoin', 1), 
		[
			'companions:copper_coin'
		]
	)
	
	event.shapeless(
		Item.of('minecraft:emerald', 1), 
		[
			'kubejs:tolecoin'
		]
	)
})
