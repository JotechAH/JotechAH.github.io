// priority: 20
ServerEvents.commandRegistry(event => {
	const { commands: Commands, arguments: Arguments } = event;

	function hasCuriosEquipped(player) {
	let found = false;

	player.curiosInventory.getCurios().forEach((identifier, slotInventory) => {
	const stacks = slotInventory.getStacks();
	for (let slot = 0; slot < stacks.slots; slot++) {
		const item = stacks.getStackInSlot(slot);
		if (!item.isEmpty()) {
		found = true;
		return; // exit the for-loop early for this slotInventory
		}
	}
	});

	return found;
	}

	function clearCurios(player) {
	player.curiosInventory.getCurios().forEach((identifier, slotInventory) => {
	const stacks = slotInventory.getStacks();
	for (let slot = 0; slot < stacks.slots; slot++) {
		const item = stacks.getStackInSlot(slot);
		if (!item.isEmpty()) {
		stacks.setStackInSlot(slot, Item.empty); // clear this slot
		}
	}
	});
	}

	event.register(
		Commands.literal("creativeworld")
		.requires(s => s.hasPermission(2)) // adjust with ftbranks later
		.then(
		Commands.literal("enter")
			.then(
				Commands.argument("player", Arguments.STRING.create(event)).executes(ctx => {
					let executor = ctx.source.player;
					let playerName = Arguments.STRING.getResult(ctx, "player");
					let targetPlayer = ctx.source.server.getPlayer(playerName);
					
					if (!targetPlayer) {
						if (executor) {
							executor.tell("§cPlayer not found!");
						}
						return 0;
					}

					// Check if target player is already in creative world
					if (targetPlayer.level.dimension.toString() === "tolerance:creatif") {
						if (executor) {
							executor.tell("§c" + targetPlayer.username + " is already in the Creative World!");
						}
						return 0;
					}

					// Check curios first
					if (hasCuriosEquipped(targetPlayer)) {
						if (executor) {
							executor.tell("§c" + targetPlayer.username + " must remove all curios items before going into Creative World!");
						}
						targetPlayer.tell("§cPlease remove all your curios items before going into Creative World!");
						return 0;
					}

					try {
						global.saveInventory(targetPlayer);
						targetPlayer.inventory.clear();

						// Use the KubeJS specific teleportTo method with ResourceLocation
						targetPlayer.teleportTo("tolerance:creatif", 0.0, 71.0, 0.0, 0.0, 0.0);
						
						targetPlayer.tell("§aYou entered the Creative World! Inventory saved.");
						if (executor && executor !== targetPlayer) {
							executor.tell("§a" + targetPlayer.username + " has been sent to the Creative World.");
						}

						// Add small delay before changing gamemode and rank
						targetPlayer.server.scheduleInTicks(5, () => {
							targetPlayer.setGameMode("creative");
							targetPlayer.runCommandSilent("ftbranks add " + targetPlayer.username + " creative_builder");
						});

						return 1;
					} catch (error) {
						console.error("Error entering creative world: " + error);
						if (executor) {
							executor.tell("§cError sending " + targetPlayer.username + " to creative world. Please try again.");
						}
						targetPlayer.tell("§cError entering creative world. Please try again.");
						return 0;
					}
				})
			)
		)
	);
	event.register(
		Commands.literal("exit").executes(ctx => {
			let player = ctx.source.player;
			if (!player) return 0;

			// Check if player is in creative world
			if (player.level.dimension.toString() !== "tolerance:creatif") {
				player.tell("§cYou are not in the Creative World!");
				return 0;
			}

			try {
				// Clear inventories before restoring
					player.inventory.clear();
					clearCurios(player); // <- auto-clear curios here
				
				// Add delay before restoring inventory, location, and changing gamemode
				player.server.scheduleInTicks(10, () => {
					global.loadInventory(player); // This will now handle teleporting back to saved location
					player.setGameMode("survival");
					player.runCommandSilent("ftbranks remove " + player.username + " creative_builder");
					player.tell("§aYou returned to Survival World! Inventory and location restored.");
				});

				return 1;
			} catch (error) {
				console.error("Error exiting creative world: " + error);
				player.tell("§cError exiting creative world. Please try again.");
				return 0;
			}
		})
	)
});